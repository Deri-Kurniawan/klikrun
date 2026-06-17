const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
	const { languages, commands, workspace, window, CodeLens, Range, EventEmitter } = vscode;

	// Map of lock filenames to their package manager names
	const lockMap = [
		['package-lock.json', 'npm'],
		['yarn.lock', 'yarn'],
		['pnpm-lock.yaml', 'pnpm'],
		['pnpm-lock.yml', 'pnpm'],
		['bun.lockb', 'bun'],
		['bun.lock', 'bun'],
	];

	// Used to refresh CodeLenses when the document is edited
	const emitter = new EventEmitter();
	const provider = {
		onDidChangeCodeLenses: emitter.event,

		/**
		 * Called by VS Code to get CodeLenses for a document.
		 * Parses package.json -> detects package managers from lock files ->
		 * creates a clickable lens per script per package manager.
		 */
		provideCodeLenses(doc) {
			// Only handle files named package.json
			if (!doc.fileName.endsWith('package.json')) return [];
			// Silently skip invalid JSON
			let json;
			try { json = JSON.parse(doc.getText()); } catch { return []; }
			// No scripts section = nothing to lens
			if (!json.scripts) return [];

			// Derive working directory from the package.json's location (handles nested projects)
			const scriptDir = path.dirname(doc.uri.fsPath);
			const rootDir = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath;

			const pms = [...new Set(
				[scriptDir, rootDir].filter(Boolean).flatMap(dir =>
					lockMap.filter(([file]) => fs.existsSync(path.join(dir, file)))
						.map(([, pm]) => pm)
				)
			)];
			// Fallback to npm if no lock file found
			if (!pms.length) pms.push('npm');

			// Build one CodeLens per script per package manager
			const text = doc.getText();
			const lenses = [];
			for (const name of Object.keys(json.scripts)) {
				// Find the line where this script key appears
				const idx = text.indexOf(`"${name}"`);
				if (idx < 0) continue;
				const range = new Range(doc.positionAt(idx).line, 0, doc.positionAt(idx).line, 0);
				for (const pm of pms) {
					lenses.push(new CodeLens(range, {
						title: `$(play) ${pm}`,
						command: 'klikrun.runScript',
						arguments: [pm, name, scriptDir] // scriptDir is used as terminal cwd
					}));
				}
			}
			return lenses;
		}
	};

	// Register the CodeLens provider for all package.json files
	context.subscriptions.push(
		languages.registerCodeLensProvider({ pattern: '**/package.json' }, provider)
	);

	// Command handler: opens a new terminal in the script's directory and runs the command
	context.subscriptions.push(
		commands.registerCommand('klikrun.runScript', (pm, name, scriptDir) => {
			const term = window.createTerminal({ name: `${pm} run ${name}`, cwd: scriptDir });
			term.show();
			term.sendText(`${pm} run ${name}`);
		})
	);

	// Refresh CodeLenses whenever package.json content changes
	context.subscriptions.push(
		workspace.onDidChangeTextDocument(e => {
			if (e.document.fileName.endsWith('package.json')) emitter.fire();
		})
	);
}

function deactivate() { }

module.exports = { activate, deactivate };

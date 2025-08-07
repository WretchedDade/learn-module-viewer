const include = /\[!include\[\]\(([^)]+)\)\]/;
const codeDirective = /:::code\s+language="([^"]+)"\s+source="([^"]+)"(?:\s+highlight="([^"]+)")?(?:\s+range="([^"]+)")?(?:\s+id="([^"]+)")?:::/g;

export const githubRegex = {
    include,
	codeDirective
};

const fs = require('fs');

// 1. Read files
const srcHtml = fs.readFileSync('../wrennon-showcase/frontend/agent/admin_dashboard.html', 'utf8');
const destHtml = fs.readFileSync('demo-admin.html', 'utf8');

// 2. Extract <body> from srcHtml
const bodyMatch = srcHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) {
    console.error("Could not find body in src");
    process.exit(1);
}
let newBody = bodyMatch[1];

// 3. Remove connectPresenceWebSocket() from newBody (it's called at the end of the script)
newBody = newBody.replace(/connectPresenceWebSocket\(\);/, '// connectPresenceWebSocket();');

// 4. Find the mock fetch logic from destHtml
const mockMatch = destHtml.match(/(\/\/ --- INJECT STATIC MOCK FETCH FOR DEMO ---[\s\S]*?\/\/ --- END MOCK FETCH ---)/);
if (mockMatch) {
    // Inject mock logic at the top of the <script> block in newBody
    newBody = newBody.replace(/<script>/, `<script>\n${mockMatch[1]}\n`);
} else {
    console.warn("Could not find mock logic in dest");
}

// 5. Replace <body> in destHtml
const finalHtml = destHtml.replace(/<body[^>]*>[\s\S]*?<\/body>/, `<body>${newBody}</body>`);

// 6. Write to demo-admin.html
fs.writeFileSync('demo-admin.html', finalHtml, 'utf8');
console.log("Successfully ported admin_dashboard.html to demo-admin.html");

// 7. Update demo-agent.html (change input to textarea)
let agentHtml = fs.readFileSync('demo-agent.html', 'utf8');
agentHtml = agentHtml.replace(
    /<input id="agent-message-input" type="text" placeholder="Type a reply" autocomplete="off">/,
    `<textarea id="agent-message-input" placeholder="Type a reply" style="resize: vertical; min-height: 44px; height: 44px; font-family: inherit; line-height: 24px; box-sizing: border-box; overflow-y: hidden;" rows="1"></textarea>`
);
fs.writeFileSync('demo-agent.html', agentHtml, 'utf8');
console.log("Successfully updated demo-agent.html");

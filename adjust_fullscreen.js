const fs = require('fs');
let html = fs.readFileSync('live-demo.html', 'utf8');

const oldHeaderStyle = `.demo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 48px 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }`;

const newHeaderStyle = `.demo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 24px 24px 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }`;

// Also reduce the gap in demo-frames slightly if they want an immersive feel
const oldFrames = `.demo-frames {
    display: flex;
    gap: 32px;
    flex: 1;
    align-items: stretch;
  }`;

const newFrames = `.demo-frames {
    display: flex;
    gap: 16px;
    flex: 1;
    align-items: stretch;
    padding: 0 16px 16px;
  }`;

if (html.includes(oldHeaderStyle)) {
  html = html.replace(oldHeaderStyle, newHeaderStyle);
}
if (html.includes(oldFrames)) {
  html = html.replace(oldFrames, newFrames);
}

fs.writeFileSync('live-demo.html', html);
console.log("Adjusted header margins and frames padding for true fullscreen mode.");

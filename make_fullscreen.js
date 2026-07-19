const fs = require('fs');
let html = fs.readFileSync('live-demo.html', 'utf8');

const oldLayout = `.demo-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 32px 32px;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    min-height: calc(100vh - 80px); /* Account for nav */
  }`;

const newLayout = `.demo-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    max-width: 100%;
    margin: 0;
    width: 100%;
    min-height: calc(100vh - 80px); /* Account for nav */
  }`;

if (html.includes(oldLayout)) {
  html = html.replace(oldLayout, newLayout);
  
  // Also adjust the demo-frames gap and browser-mockup border-radius if they want "puratai full screen"
  // Let's also hide the demo header to give it that true fullscreen app feel? 
  // "dui pasher faka space remove kre" (remove empty space on both sides). I'll stick to removing the padding and max-width.
  
  fs.writeFileSync('live-demo.html', html);
  console.log("Successfully made the demo layout full screen!");
} else {
  console.log("oldLayout not found. Let's try regex.");
  html = html.replace(/padding:\s*0\s+32px\s+32px;/, "padding: 0;");
  html = html.replace(/max-width:\s*1600px;/, "max-width: 100%;");
  fs.writeFileSync('live-demo.html', html);
  console.log("Replaced using regex.");
}

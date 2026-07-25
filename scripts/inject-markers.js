const fs=require('fs'); 
let t=fs.readFileSync('demo-admin.html','utf8'); 
t=t.replace(/<div id="admin-light-themes" class="theme-tab-content active">/, `<div id="admin-light-themes" class="theme-tab-content active">\n<!-- THEME-LIST-LIGHT-START -->`); 
t=t.replace(/(<button class="theme-option" data-theme-value="light-graphite" role="menuitem">Graphite Monochrome<\/button>\s*)/, '$1<!-- THEME-LIST-LIGHT-END -->\n'); 
t=t.replace(/<div id="admin-dark-themes" class="theme-tab-content hidden">/, `<div id="admin-dark-themes" class="theme-tab-content hidden">\n<!-- THEME-LIST-DARK-START -->`); 
t=t.replace(/(<button class="theme-option" data-theme-value="dark-graphite" role="menuitem">Graphite Monochrome<\/button>\s*)/, '$1<!-- THEME-LIST-DARK-END -->\n'); 
fs.writeFileSync('demo-admin.html',t);

const fs = require('fs');
const f = 'src/pages/admin/edit/[id].tsx';
let c = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

// Remove the duplicate "if (found) {" and the "} else {" block
const dupStart = c.indexOf('\n        if (found) {\n');
const elseBlock = c.indexOf('\n        } else {\n          setLoadError("No se encontró el producto solicitado.");\n        }');

if (dupStart !== -1 && elseBlock !== -1) {
  // Remove "if (found) {" wrapper - find its closing brace
  // Replace: "        if (found) {\n" with ""
  c = c.replace('\n        if (found) {\n', '\n');
  // Remove the else block
  c = c.replace('\n        } else {\n          setLoadError("No se encontró el producto solicitado.");\n        }', '');
  // Remove the extra closing brace before "} catch"
  c = c.replace('\n        }\n      } catch {', '\n      } catch {');
}

fs.writeFileSync(f, c, 'utf8');
console.log('ok');

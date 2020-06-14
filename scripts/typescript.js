const fs = require("fs");
const {
  quicktype,
  InputData,
  jsonInputForTargetLanguage
} = require("quicktype-core");

var manifest = require("../data/manifest.json");

manifest.damagedecks = require("../" + manifest.damagedecks);
manifest.factions = require("../" + manifest.factions);
manifest.stats = require("../" + manifest.stats);
manifest.actions = require("../" + manifest.actions);
manifest.pilots.forEach(obj => {
  obj.ships = obj.ships.map(ship => require("../" + ship));
});
manifest.upgrades = manifest.upgrades.map(upgrade => require("../" + upgrade));
manifest.conditions = require("../" + manifest.conditions);
manifest["quick-builds"] = manifest["quick-builds"].map(qb =>
  require("../" + qb)
);

const dir = "typescript";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  console.log("create dir " + dir);
}

const jsonString = JSON.stringify(manifest);

fs.writeFile(dir + "/manifest.json", jsonString, err => {
  if (err) throw err;
  else console.log("wrote manifest.json");
});

async function generateInterface(targetLanguage, typeName, jsonString) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage);

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString]
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return (
    await quicktype({
      inputData,
      lang: targetLanguage
    })
  ).lines.join("\n");
}

generateInterface("typescript", "manifest", jsonString).then(tsString =>
  fs.writeFile(dir + "/manifest.ts", tsString, err => {
    if (err) throw err;
    else console.log("wrote manifest.ts");
  })
);

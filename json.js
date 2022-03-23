function form1(){
  let file_name = document.getElementById("file_name").value;
  let item_name = document.getElementById("item_name").value;
  let item_id = document.getElementById("item_id").value;
  let saturation_num = document.getElementById("saturation_num").value;
  let hiddensaturation_num = document.getElementById("hiddensaturation_num").value;
  let use_duration = document.getElementById("use_duration").value;
  let commanduse = document.getElementById('commanduse').checked;
  let animation_type = document.getElementById("animation_type").value;
  let JSONData = {
  "format_version": "1.18.0",
  "minecraft:item": {
    "description": {
      "identifier": item_id,
      "category": "construction"
    },

    "components": {
      "minecraft:icon": {
        "texture": "food"
      },
      "minecraft:display_name": {
        "value": item_name
      },
      "minecraft:use_animation": animation_type,
      "minecraft:use_duration": Number(use_duration),
      "minecraft:food": {
        "nutrition": Number(saturation_num),
        "saturation_modifier": Number(hiddensaturation_num)
      }
    }
  }
};
  if(commanduse){
    let commands = document.getElementById("commands").value;
    commands = commands.split('\n');
    JSONData["minecraft:item"]["components"]["minecraft:food"]["on_consume"] = {
          "event": "food",
          "target": "self"
        };
   JSONData["minecraft:item"]["events"] = {};
   JSONData["minecraft:item"]["events"]["food"] = {
        "run_command": {
          "command": commands,
          "target": "holder"
        }        
      };
  };
  let Encodejson = JSON.stringify(JSONData, null, 2);
  let DLlink = document.createElement( 'a' );
	DLlink.href = window.URL.createObjectURL( new Blob( [Encodejson] ) );
	DLlink.download = `${file_name}.json`;
	DLlink.click();
  
  document.getElementById("json_output").innerHTML = Encodejson;
  let a = document.getElementsByTagName("textarea").length -1
  let textarea = document.getElementsByTagName("textarea")[a];
  // 文字をすべて選択
  textarea.select();
  // コピー
  document.execCommand("copy");

}


function formB1(){
  let file_name = document.getElementById("file_name").value;
  let item_id = document.getElementById("item_id").value;
  let amount = document.getElementById("amount").value;
  let income = document.getElementById("income").checked;
  let money = document.getElementById("money").value;
  let user_id = document.getElementById("user_id").value;
  let commands = `give @p[tag=!sneak,r=1,scores={sil=${amount}..}] ${item_id} 1 `;
  let DLlink = document.createElement( 'a' );
	DLlink.href = window.URL.createObjectURL( new Blob( [Encodejson] ) );
	DLlink.download = `${file_name}.json`;
	DLlink.click();
  
  document.getElementById("json_output").innerHTML = Encodejson;
  let a = document.getElementsByTagName("textarea").length -1
  let textarea = document.getElementsByTagName("textarea")[a];
  // 文字をすべて選択
  textarea.select();
  // コピー
  document.execCommand("copy");

}

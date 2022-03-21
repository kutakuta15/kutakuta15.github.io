function form1(){
  let item_name = document.getElementById("item_name").value;
  let item_id = document.getElementById("item_id").value;
  let saturation_num = document.getElementById("saturation_num").value;
  let hiddensaturation_num = document.getElementById("hiddensaturation_num").value;
  let use_duration = document.getElementById("use_duration").value;
  let animation_type = document.getElementById("animation_type").value;
  let commands = document.getElementById("commands").value;
  commands = commands.split('\n');
  let JSONData = {
  "format_version": "1.18.0",
  "minecraft:item": {
    "description": {
      "identifier": item_id,
      "category": "construction"
    },

    "components": {
      "minecraft:icon": {
        "texture": "grim_food_1"
      },
      "minecraft:display_name": {
        "value": item_name
      },
      "minecraft:use_animation": animation_type,
      "minecraft:use_duration": use_duration,
      "minecraft:food": {
        "nutrition": saturation_num,
        "saturation_modifier": hiddensaturation_num,
        "on_consume": {
          "event": "food",
          "target": "self"
        }
      }
    },
    "events":{
      "food": {
        "run_command": {
          "command": commands,
          "target": "holder"
        }        
      }
    }
  }
};
  let Encodejson = JSON.stringify(JSONData);
  document.getElementById("json_output").innerHTML = Encodejson;

  let textarea = document.getElementsByTagName("textarea")[1];
  // 文字をすべて選択
  textarea.select();
  // コピー
  document.execCommand("copy");

}

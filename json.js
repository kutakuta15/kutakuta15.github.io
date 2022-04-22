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

/*https://elearn.jp/jmemo/javascript/memo-325.html*/

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


function form2(){
  let Key1 = document.getElementById("Key1").value;
  let Key2 = document.getElementById("Key2").value;
  let Key3 = document.getElementById("Key3").value;
  let Key4 = document.getElementById("Key4").value;
  let Key5 = document.getElementById("Key5").value;
  let Key6 = document.getElementById("Key6").value;
  let Key7 = document.getElementById("Key7").value;
  let Key8 = document.getElementById("Key8").value;
  let Key9 = document.getElementById("Key9").value;
  let Keys = [];
  let upKeys = [];
  let centerKeys = [];
  let downKeys = [];
}


function formB1(){
  let file_name = document.getElementById("file_name").value;
  let item_id = document.getElementById("item_id").value;
  let amount = document.getElementById("amount").value;
  let income = document.getElementById("income").checked;
  let commands = '';
  if(income){
    let money = document.getElementById("money").value;
    let user_id = document.getElementById("user_id").value;
    commands = `execute @p[tag=!sneak,r=1,scores={sil=${amount}..}] ~~~ scoreboard players add ${user_id} sil ${money}\n
execute @p[tag=sneak,r=1,scores={sil=${amount*10}..}] ~~~ scoreboard players add ${user_id} sil ${money*10}\n\n`;
  }
 
  commands = `${commands}give @p[tag=!sneak,r=1,scores={sil=${amount}..}] ${item_id} 1\n
playsound random.orb @p[tag=!sneak,r=1,scores={sil=${amount}..}] ~~~ 1 2\n
tellraw @p[tag=!sneak,r=1,scores={sil=${amount}..}] {"rawtext":[{"text":"§b購入成功！ / bought!\\n-${amount}sil"}]}\n
scoreboard players remove @p[tag=!sneak,r=1,scores={sil=${amount}..}] sil ${amount}\n
tellraw @p[tag=!sneak,r=1,scores={sil=..${amount-1}}] {"rawtext":[{"text":"§4所持金が不足しています！"}]}\n
playsound note.bass @p[tag=!sneak,r=1,scores={sil=..${amount-1}}]\n
give @p[tag=sneak,r=1,scores={sil=${amount*10}..}] ${item_id} 10\n
playsound random.orb @p[tag=sneak,r=1,scores={sil=${amount*10}..}] ~~~ 1 2\n
tellraw @p[tag=sneak,r=1,scores={sil=${amount*10}..}] {"rawtext":[{"text":"§b購入成功！ / bought!\\n-${amount*10}sil"}]}\n
scoreboard players remove @p[tag=sneak,r=1,scores={sil=${amount*10}..}] sil ${amount*10}\n
tellraw @p[tag=sneak,r=1,scores={sil=..${amount*10-1}}] {"rawtext":[{"text":"§4所持金が不足しています！"}]}\n
playsound note.bass @p[tag=sneak,r=1,scores={sil=..${amount*10-1}}]\n`;

  let DLlink = document.createElement( 'a' );
	DLlink.href = window.URL.createObjectURL( new Blob( [commands] ) );
	DLlink.download = `${file_name}.mcfunction`;
	DLlink.click();
  
  document.getElementById("commands_output").innerHTML = commands;
  let textarea = document.getElementsByTagName("textarea")[0];
  // 文字をすべて選択
  textarea.select();
  // コピー
  document.execCommand("copy");

}


function formB2(){
  let output;
  let json = JSON.parse(document.getElementById("json").value);
  for(let a = 0; a < json["minecraft:npc_dialogue"]["scenes"].length; a++){
    let scene = json["minecraft:npc_dialogue"]["scenes"][a];
    let formName = JSON.stringify(scene["scene_tag"]) || "showform";
    let title = JSON.stringify(scene["npc_name"]);
    let body = JSON.stringify(scene["text"]);
    if(scene["text"]["rawtext"])body = JSON.stringify(scene["text"]["rawtext"][0]["text"]);
    let buttons; let buttoncommands;
    for(let b = 0; b < scene.buttons.length; b++){
      if(scene.buttons[b].commands){
        let commands;
        for(let c = 0; c < scene.buttons[b].commands.length; c++){
          let text = scene.buttons[b].commands[c].replace(/@initiator/g,'@s');
          if(commands)commands = `${commands}\n      player.runCommand(\`${text}\`);`;
          else commands = `player.runCommand(\`${text}\`);`;
        };
        if(buttoncommands)buttoncommands = `${buttoncommands}\n    if(response.selection === ${b}){
      ${commands}
    };`;
        else buttoncommands = `if(response.selection === ${b}){
      ${commands}
    };`;
      };
      let buttontext = scene.buttons[b].name;
      if(scene.buttons[b].name.rawtext)buttontext = scene.buttons[b].name.rawtext[0].text;
      if(buttons)buttons = `${buttons}\n				.button(${JSON.stringify(buttontext)})`;
      else buttons = `				.button(${JSON.stringify(buttontext)})`;
    };
    let form = `function ${formName}(player){`
    if(opencommands)form = `${form}
  ${opencommands}`
    form = `  let form = new ActionFormData()
  				.title(${title})
  				.body(${body})
  ${buttons};`
    if(buttoncommands)form = `${form}
  form.show(player).then((response) => {
    ${buttoncommands}
  });
`;
    form = `${form}
};`
    if(output)output = `${output}\n\n${form}`;
    else output = form;
  };
  document.getElementById("js_output").innerHTML = output;
  let textarea = document.getElementsByTagName("textarea")[1];
  // 文字をすべて選択
  textarea.select();
  // コピー
  document.execCommand("copy");
}


"use strict";
const mineflayer=require("mineflayer");//Minecraft機器人API
const Vec3=require("vec3");//用於建立座標物件
//const {exec}=require("child_process");//用於執行新任務
const fs=require("fs");//用於檔案讀寫
const readline=require("readline");//讀取終端機
const nbt = require("prismarine-nbt");//讀取nbt檔案 往xyz軸正向發展
const {mapColor} = require("./mapColor");//取得方塊的mapcolor
const {colorMessage} = require("./colorMessage");//ansi文字改到這了。
/*/warp jimmytsao
warp使用序列
用函式包裝移動到目標附近
找不到路徑
盡量減少飛行消耗
確認站立不用時數
用羊毛測試放置功能的間歇
用實際檢查來確定是否到位
更精細的位移
不是，請移動前先到整數座標。
移動錯誤不是速度問題
const needFirstBuildList = ['air', 'cobblestone', 'glass']
目標方塊上方 2 格。看看 X 周圍還有哪些「同材料」，方塊中心距離眼睛不能超過 6
for (let cP_dz = -4; cP_dz <= 4; cP_dz++)
    for (let cP_dx = -4; cP_dx <= 4; cP_dx++)
        for (let cP_dy = 5; cP_dy >= -3; cP_dy--)
bot._client.write('block_place', packet)
{
    location: dAbsolutePos,
    direction: 0,
    heldItem: Item.toNotch(bot.heldItem),
    cursorX: 0.5,
    cursorY: 0.5,
    cursorZ: 0.5
}
真正的「放置成功」是靠 blockUpdate 確認
bot.on('blockUpdate', updateVisited)
client 發 block_place
       ↓
不直接相信成功
       ↓
等待 server blockUpdate
       ↓
確認 old/new block
       ↓
標記完成
forcedMoveFlag = true
*/

const inputFile=fs.readFileSync("./Amitabha3.nbt");//輸入的nbt檔

const referencePoint=[-2112,100,6079];//地圖左上角，往北一格，建築將會往x+,y+,z+發展[64,56,-65]
const heightLimit=255;//建築高度上限 Overworld：319； Nether/The End 255

//依序輸入前往目標位置的方法：如"/warp LogoCat"
const warpPath=[//建造地點前往指令&&等待的回饋
  {a:"/homes map",b:"傳送到 map。"}
];
const materialPath=[//材料地點前往指令&&等待的回饋
  {a:"/warp delr1_2",b:"[系統] 已抵達 公共傳送點「delr1_2」，輸入 /backui 回程"}
];

//輸入操作員在遊戲內的玩家名稱，如"LogoCat"
const owner="";

const fallout=1;//1->廢土模式

//在此設定登入資訊
const botArgs={
  auth:"microsoft",//登入帳號種類，使用Microsoft帳號
  host:"jp.mcfallout.net",//登入的伺服器
  //port:"52776",//伺服器的連接埠
  username:"",//"aching200e@yahoo.com.tw",Microsoft帳號如：abcd@gmail.com 
  version:"1.21.11",//登入使用的Minecraft版本，有些版本會導致錯誤"1.21.11"1.20.4
  locale:"zh_tw",
  viewDistance:8,
  hideErrors:false,//true->隱藏錯誤
  physicsEnabled:false//false停用物理規則
};
  
const mapColorBlocks={
  NONE:{Name:"minecraft:glass"},
  GRASS:{Name:"minecraft:slime_block"},
  SAND:{Name:"minecraft:glowstone"},
  WOOL:{Name:"minecraft:mushroom_stem"},
  FIRE:{Name:"minecraft:redstone_block"},
  ICE:{Name:"minecraft:packed_ice"},
  METAL:{Name:"minecraft:iron_trapdoor"},
  PLANT:{Name:"minecraft:bamboo_block",Properties:{axis:"x"}},
  SNOW:{Name:"minecraft:white_wool"},
  CLAY:{Name:"minecraft:clay"},
  DIRT:{Name:"minecraft:jungle_planks"},
  STONE:{Name:"minecraft:cobblestone"},
  WATER:{Name:"minecraft:blue_wool"},//不支援水
  WOOD:{Name:"minecraft:oak_planks"},
  QUARTZ:{Name:"minecraft:quartz_block"},
  COLOR_ORANGE:{Name:"minecraft:orange_wool"},
  COLOR_MAGENTA:{Name:"minecraft:magenta_wool"},
  COLOR_LIGHT_BLUE:{Name:"minecraft:light_blue_wool"},
  COLOR_YELLOW:{Name:"minecraft:yellow_wool"},
  COLOR_LIGHT_GREEN:{Name:"minecraft:light_green_wool"},
  COLOR_PINK:{Name:"minecraft:pink_wool"},
  COLOR_GRAY:{Name:"minecraft:gray_wool"},
  COLOR_LIGHT_GRAY:{Name:"minecraft:light_gray_wool"},
  COLOR_CYAN:{Name:"minecraft:cyan_wool"},
  COLOR_PURPLE:{Name:"minecraft:purple_wool"},
  COLOR_BLUE:{Name:"minecraft:blue_wool"},
  COLOR_BROWN:{Name:"minecraft:brown_wool"},
  COLOR_GREEN:{Name:"minecraft:green_wool"},
  COLOR_RED:{Name:"minecraft:red_wool"},
  COLOR_BLACK:{Name:"minecraft:black_wool"},
  GOLD:{Name:"minecraft:gold_block"},
  DIAMOND:{Name:"minecraft:prismarine_bricks"},
  LAPIS:{Name:"minecraft:lapis_block"},
  EMERALD:{Name:"minecraft:emerald_block"},
  PODZOL:{Name:"minecraft:spruce_planks"},
  NETHER:{Name:"minecraft:magma_block"},
  TERRACOTTA_WHITE:{Name:"minecraft:cherry_planks"},
  TERRACOTTA_ORANGE:{Name:"minecraft:orange_terracotta"},
  TERRACOTTA_MAGENTA:{Name:"minecraft:magenta_terracotta"},
  TERRACOTTA_LIGHT_BLUE:{Name:"minecraft:light_blue_terracotta"},
  TERRACOTTA_YELLOW:{Name:"minecraft:yellow_terracotta"},
  TERRACOTTA_LIGHT_GREEN:{Name:"minecraft:lime_terracotta"},
  TERRACOTTA_PINK:{Name:"minecraft:pink_terracotta"},
  TERRACOTTA_GRAY:{Name:"minecraft:gray_terracotta"},
  TERRACOTTA_LIGHT_GRAY:{Name:"minecraft:light_gray_terracotta"},
  TERRACOTTA_CYAN:{Name:"minecraft:cyan_terracotta"},
  TERRACOTTA_PURPLE:{Name:"minecraft:purple_terracotta"},
  TERRACOTTA_BLUE:{Name:"minecraft:blue_terracotta"},
  TERRACOTTA_BROWN:{Name:"minecraft:brown_terracotta"},
  TERRACOTTA_GREEN:{Name:"minecraft:green_terracotta"},
  TERRACOTTA_RED:{Name:"minecraft:red_terracotta"},
  TERRACOTTA_BLACK:{Name:"minecraft:black_terracotta"},
  CRIMSON_NYLIUM:{Name:"minecraft:crimson_nylium"},
  CRIMSON_STEM:{Name:"minecraft:crimson_planks"},
  CRIMSON_HYPHAE:{Name:"minecraft:crimson_hyphae",Properties:{axis:"x"}},
  WARPED_NYLIUM:{Name:"minecraft:warped_nylium"},
  WARPED_STEM:{Name:"minecraft:warped_planks"},
  WARPED_HYPHAE:{Name:"minecraft:warped_hyphae",Properties:{axis:"x"}},
  WARPED_WART_BLOCK:{Name:"minecraft:warped_wart_block"},
  DEEPSLATE:{Name:"minecraft:deepslate"},
  RAW_IRON:{Name:"minecraft:raw_iron_block"},
  GLOW_LICHEN:{Name:"minecraft:verdant_froglight"},
};//替換方塊清單

/*
data
{
  blocks: [
    { pos: [ 0, 64, 0 ], state: 46 },
    ],
  entities: [],
  palette: [
    { Name: 'minecraft:sandstone' },
    { Name: 'minecraft:cobblestone' }
    { Name: 'minecraft:cobblestone',Properties:{axis:"y"} }
  ],
  size: [ 128, 110, 129 ],
  author: 'rebane2001.com/mapartcraft',
  DataVersion: 3463
}
*/
async function decodeNBT() {
  // 解析 NBT
  const {parsed}=await nbt.parse(inputFile);
  let data=nbt.simplify(parsed);
  data.palette=data.palette.map(item=>{//替換成指定的方塊
    return mapColorBlocks[mapColor(item)]||item;
  });
  logMessage("需求材料：");
  logMessage(data.palette);
  let mapData={}
  mapData.blocks=data.palette.map(palette=>({palette,pos:[]}));
  for(let {pos,state} of data.blocks) {
    if(mapData.blocks[state]){
      mapData.blocks[state].pos.push(pos);
      mapData.blocks[state].qty=mapData.blocks[state].qty??0+1;
    }
  }
  const needFirstBuildList=["air","cobblestone","glass"];//需提前建造的方塊
  mapData.blocks.sort((a,b)=>{
    const nameA=(a.palette?.Name||"").replace(/^minecraft:/,"");
    const nameB=(b.palette?.Name||"").replace(/^minecraft:/,"");
    const indexA=needFirstBuildList.indexOf(nameA);
    const indexB=needFirstBuildList.indexOf(nameB);
    if(indexA!==-1&&indexB!==-1)return indexA-indexB;
    if(indexA!==-1)return -1;
    if(indexB!==-1)return 1;
    return 0;
  });
  mapData.palette=data.palette;
  mapData.size=data.size;
  mapData.DataVersion=data.DataVersion;
  /*{
    blocks:[
      {
        palette:{ Name: 'minecraft:sandstone' },
        qty:3,
        pos:[
          [x,y,z],
          [x,y,z],
          [x,y,z]
        ]
      }
    ]
    palette: [
      { Name: 'minecraft:sandstone' },
      { Name: 'minecraft:cobblestone' }
      { Name: 'minecraft:cobblestone',Properties:{axis:"y"} }
    ],
    size: [ 128, 110, 129 ],
    DataVersion: 3463
  }*/
  return mapData;
}

//建立讀取介面
const rl=readline.createInterface({
  input:process.stdin,
  output:process.stdout,
  prompt:">"
});

//主程式
class MCBot {
  constructor(){
    this.working=false;
    this.bot=null;
    this.stopPlayback=false;
    this.forcedMoveFlag=false;
    this.isStart=false;
    this.mapData=null;
    this.materialList={};
    this.initBot();
  }
  
  initBot(){
    this.bot=mineflayer.createBot(botArgs);
    this.initEvents();
  }
  
  initEvents(){
    this.bot.on("login",()=>{
      let botSocket=this.bot._client.socket;
      this.working=true;
      this.fly(0);//降落
      toConsole(`機器人已登入到 ${botSocket.server||botSocket._host}`);
    });
    this.bot.on("end",(m)=>{
      this.working=false;
      toConsole("機器人離開伺服器："+m);
      setTimeout(()=>{
        this.bot.removeAllListeners();
        this.initBot();
      },1000);
    });
    this.bot.on("error",(err)=>{
      toConsole(`錯誤：${err}`)
    });
    this.bot.on("message",(chatMessage)=>{
      let message=chatMessage.toString()
      logMessage(colorMessage(chatMessage));
      if(message=="[系統] 讀取人物成功。"){}
      else if(message.startsWith(`[系統] ${owner} 想要你傳送到 該玩家 的位置`)){this.bot.chat("/tpaccept");}
      else if(message==`[系統] ${owner} 想要傳送到 你 的位置`){this.bot.chat("/tpaccept");}
      else if(message.startsWith(`[${owner} -> 您] `)){this.feedback(message.replace(`[${owner} -> 您] `,""));}
      else{}
    });
    this.bot.on("forcedMove",(movewrong)=>{
      toConsole("移動錯誤");
      this.forcedMoveFlag=true;
    });
    
    this.bot._client.on("block_change",(packet)=>{
      //{ location: { x: -2242, z: 6079, y: 101 }, type: 0 } 空氣
      if(this.isStart&&this.mapData&&packet.type&&packet.type!==0){
        logMessage("增加");
        let rx=packet.location.x-referencePoint[0];
        let ry=packet.location.y-referencePoint[1];
        let rz=packet.location.z-referencePoint[2];
        logMessage(`${rx},${ry},${rz}`);
        if(rx>=0&&ry>=0&&rz>=0&&rx<this.mapData.size[0]&&ry<this.mapData.size[1]&&rz<this.mapData.size[2]){
          logMessage("範圍內");
          let blocks=this.mapData.blocks;
          for(let m=0;m<blocks.length;m++){
            for(let n=0;n<blocks[m].pos.length;n++){
              let pos=blocks[m].pos[n];
              if(pos&&pos[0]===rx&&pos[1]===ry&&pos[2]===rz){
                //blockUpdate->-目標位置、若有方塊則刪除&設定材料數量mapData.blocks[m].pos[n]
                logMessage("找到對應方塊");
                logMessage(this.mapData.blocks[m].pos[n]);
                this.mapData.blocks[m].pos[n]=null;
                return;
              }
            }
          }
        }
      }
    });

    /*this.bot.on("blockUpdate",(oldBlock,newBlock)=>{
      logMessage("方塊更新------------");
      logMessage(oldBlock.name);
      logMessage(newBlock.name);
      if(this.isStart&&this.mapData&&(!oldBlock||oldBlock.name==="air")&&(newBlock&&newBlock.name!="air")){
        logMessage("增加");
        let rx=newBlock.position.x-referencePoint[0];
        let ry=newBlock.position.y-referencePoint[1];
        let rz=newBlock.position.z-referencePoint[2];
        logMessage(`${rx},${ry},${rz}`);
        if(rx>=0&&ry>=0&&rz>=0&&rx<this.mapData.size[0]&&ry<this.mapData.size[1]&&rz<this.mapData.size[2]){
          logMessage("範圍內");
          let blocks=this.mapData.blocks;
          for(let m=0;m<blocks.length;m++){
            for(let n=0;n<blocks[m].pos.length;n++){
              let pos=blocks[m].pos[n];
              if(pos[0]===rx&&pos[1]===ry&&pos[2]===rz){
                //blockUpdate->-目標位置、若有方塊則刪除&設定材料數量mapData.blocks[m].pos[n]
                logMessage("找到對應方塊");
                logMessage(this.mapData.blocks[m].pos[n]);
                this.mapData.blocks[m].pos.splice(n,1);
                return;
              }
            }
          }
        }
      }
    });*/
  }
  
  feedback(input){
    if(input.startsWith("start")){
      try {
        this.start(Number(input.replace("start","").trim()));
      } catch (err) {
        logMessage(err);
        logMessage(err.stack);
      }
    }
    else if(input=="全部丟棄"){this.tossAllItems();}//丟棄身上所有物品
    else if(input=="丟棄"){if(this.bot.heldItem)this.bot.tossStack(this.bot.heldItem);}//丟棄手中物品
    else if(input.startsWith("run")){this.bot.chat(input.replace("run","").trim());}//說出指定語句
    else if(input.startsWith("move ")){let posoo=input.replace("move ","").split(" ");this.textMoveTo(posoo[0],posoo[1],posoo[2]);}//移動
    else if(input.startsWith("place ")){let posoo=input.replace("place ","").split(" ");this.placeBlock(posoo[0],posoo[1],posoo[2]);}
    else if(input.startsWith("checkPath ")){let posoo=input.replace("checkPath ","").split(" ");logMessage(this.checkPath({x:Number(posoo[0]),y:Number(posoo[1]),z:Number(posoo[2])},{x:Number(posoo[3]),y:Number(posoo[4]),z:Number(posoo[5])}));}
    else if(input.startsWith("equipItem ")){this.equipItem(input.replace("equipItem ",""));}
    else if(input=="/quit"){this.bot.quit();}
    else return(1);
    return(0);
  }
  
  async start(n){//建造地圖畫
    //解析nbt檔案
    this.mapData=await decodeNBT();
    //頂部確定
    const top=referencePoint[1]+this.mapData.size[1];
    if(top-1>heightLimit){
      toConsole("高度可能超過上限。");
      return;
    }
    //前往材料倉庫、建立倉庫清單
    for(let i of materialPath){
      await this.goto(i);
    }
    //清除物品
    this.tossAllItems();
    await wait(50);
    const shulkerBoxes=await this.findShulkers();
    //前往建造地點
    for(let i of warpPath){
      await this.goto(i);
    }
    logMessage("建立所需材料清單");
    //建立所需材料清單
    for(let i=0;i<this.mapData.blocks.length;i++){
      let blockIndex=this.mapData.blocks[i];
      let name=blockIndex.palette.Name.replace("minecraft:","");
      let newPos=[];
      for(let pos of blockIndex.pos){
        //目標位置、若無方塊則保留
        let x=pos[0]+referencePoint[0];
        let y=pos[1]+referencePoint[1];
        let z=pos[2]+referencePoint[2];
        let block=this.bot.blockAt(new Vec3(x,y,z));
        if(!block||block.name==="air")newPos.push(pos);
      }
      this.mapData.blocks[i].pos=newPos;
      this.mapData.blocks[i].qty=newPos.length;
    }      //blockUpdate->-目標位置、若有方塊則刪除&設定材料數量
    this.isStart=true;
    logMessage("d開始建造");


    //開始建造--------------------------------------------------------------------------
    for(let i=0;i<this.mapData.blocks.length;i++){
      //方塊名稱、位置、方向
      let name=this.mapData.blocks[i].palette.Name.replace("minecraft:","");
      if(name==="air")continue;
      let face=1;
      switch(this.mapData.blocks[i].palette.Properties?.axis){
        case "x":face=4;break;
        case "z":face=2;break;
        default:face=0;
      }
      //當還有剩餘方塊時-----------------------------------------------
      let blackList=[];
      while(this.mapData.blocks[i].qty>0){
        //更新數量
        let qty=0;
        for(let k of this.mapData.blocks[i].pos){
          if(k)qty++;
        }
        this.mapData.blocks[i].qty=qty;
        logMessage("同種類方塊剩餘："+qty);
        if(qty<20)logMessage(this.mapData.blocks[i].pos);
        //移除多餘的黑名單
        if(blackList.length>this.mapData.blocks[i].qty/2){
          let nweBlackList=[];
          for(let k=blackList.length-1;k>=this.mapData.blocks[i].qty/2;k--){
            nweBlackList.unshift(blackList[k]);
          }
          blackList=nweBlackList;
        }
        //取得材料---------------------------------------------------------------------
        await this.equipItem(name);
        while(!this.bot.heldItem||this.bot.heldItem.name!==name||this.bot.heldItem.count==0){
          await this.materialGet(name,qty,shulkerBoxes);
          await this.equipItem(name);
          logMessage("嘗試取得材料："+name);
        }
        //找一個需要放置的中心方塊-----------------------------------------------
        let targ;
        let botPos=this.bot.entity.position.floored();
        //從機器人周圍開始搜尋
        for(let d=3;d<Math.max(this.mapData.size[0],this.mapData.size[1],this.mapData.size[2])+1;d+=2){
          for(let j of this.mapData.blocks[i].pos){
            if(!j)continue;
            let x=referencePoint[0]+j[0];
            let y=referencePoint[1]+j[1];
            let z=referencePoint[2]+j[2];
            let dx=Math.abs(x-botPos.x);
            let dy=Math.abs(y-botPos.y);
            let dz=Math.abs(z-botPos.z);
            if(dx<=d&&dy<=d&&dz<=d){
              targ={x:x,y:y,z:z};
              if(targ){
                //檢查黑名單
                if(blackList.includes(`${x},${y},${z}`))targ=false;
                else break;
              }
            }
          }
          if(targ)break;
        }
        if(!targ)continue;
        logMessage("前往目標：");
        logMessage(targ);
        this.fly(1);
        await this.moveTo(botPos.x+0.5,botPos.y,botPos.z+0.5);//確保座標整齊
        //前往方塊
        let move=false;
        for(let count=0;count<25;count++){
          this.forcedMoveFlag=false;
          await this.pathTo(targ.x,targ.y+1,targ.z);
          if(this.forcedMoveFlag===true){
            this.fly(0);
            await wait(100);
            this.fly(1);
            if(count%3===2)targ.y+=2;
            if(count==24){
              for(let i of warpPath){
                await this.goto(i);
              }
            }
          }
          if(this.bot.entity.position.distanceSquared(new Vec3(targ.x+0.5,targ.y+2,targ.z+0.5))<9){
            move=true;
            break;
          }
        }
        this.fly(0);
        logMessage("移動狀態："+move);
        botPos=this.bot.entity.position.floored();
        blackList.push(`${targ.x},${targ.y},${targ.z}`);
        logMessage("黑名單"+blackList.length);
        if(move===true){
          logMessage("到達，目前位置："+botPos);
          //建造範圍內的方塊y+5-3,xz+-4
          let placeList=[];
          for(let j=0;j<this.mapData.blocks[i].pos.length;j++){
            let pos=this.mapData.blocks[i].pos[j];
            if(!pos)continue;
            let x=referencePoint[0]+pos[0];
            let y=referencePoint[1]+pos[1];
            let z=referencePoint[2]+pos[2];
            let rx=x-botPos.x;
            let ry=y-botPos.y;
            let rz=z-botPos.z;
            if(rx<=4&&rx>=-4&&rz<=4&&rz>=-4&&ry<=5&&ry>=-3){
              let block=this.bot.blockAt(new Vec3(x,y,z));
              if(block&&block.name!=="air"){
                this.mapData.blocks[i].pos[j]=null;
              }
              else if(rx**2+(ry-1)**2+rz**2<=30)placeList.push([x,y,z,face]);
            };
          }
          logMessage("需要建造："+placeList.length);
          for(let k of placeList){
            if(!k)continue;
            let block=this.bot.blockAt(new Vec3(k[0],k[1],k[2]));
            if(block&&block.name==="air")this.placeBlock(k[0],k[1],k[2],k[3]);
          }
          await wait(60);
        }
      }
    }
    this.isStart=false;
    logMessage("建造完成");
  }
  
  //尋找路徑&前往特定方塊座標
  async pathTo(x,y,z,d){
    if(this.bot.entity.position.equals(new Vec3(x+0.5,y+1,z+0.5)))return true;
    let targ=new Vec3(x+0.5,y+1,z+0.5)
    let pos=this.bot.entity.position.clone();
    let path=await this.findPath(pos,targ.x,targ.y,targ.z);
    if(path===false){toConsole("尋找路徑失敗");return false;}
    for(let j of path){
      await this.moveTo(j.x,j.y,j.z);
    }
    await wait(60);
    return true;
  }
  easyPath(pos,x,y,z){
    let top=300;
    let u=true,d=true;
    let p0,p1,p2,p3;
    p0={x:pos.x,y:pos.y,z:pos.z};
    p3={x:x,y:y,z:z};
    if(this.checkPath(p0,p3))return [p0,p3];
    for(let h=0;h<=top;h++){
      p1={x:pos.x,y:pos.y+h,z:pos.z};
      p2={x:x,y:pos.y+h,z:z};
      if(u)u=this.checkPath(p0,p1);
      if(d)d=this.checkPath(p2,p3);
      if(u&&this.checkPath(p1,p3))return [p0,p1,p3];
      if(d&&this.checkPath(p0,p2))return [p0,p2,p3];
      if(u&&d&&this.checkPath(p1,p2))return [p0,p1,p2,p3];
    }
    return false;
  }
  
  async findPath(pos, x, y, z) {
    // 1. 簡單可達，直接回傳（節點最少）
    const easyPath=await this.easyPath(pos,x,y,z);
    if(easyPath)return easyPath;
    else return false;
    const start = {x: pos.x, y: pos.y, z: pos.z};
    const goal = {x, y, z};



    // 2. 搜尋參數
    const RES = 2;          // 網格解析度（每格幾個方塊），越小越精細但越慢
    const MAX_RANGE = 200;   // 搜尋範圍上限
    const MAX_NODES = 10000; // 展開節點數上限，防止卡死

    const minX = Math.min(start.x, goal.x) - MAX_RANGE;
    const maxX = Math.max(start.x, goal.x) + MAX_RANGE;
    const minY = Math.min(start.y, goal.y) - MAX_RANGE;
    const maxY = Math.max(start.y, goal.y) + MAX_RANGE;
    const minZ = Math.min(start.z, goal.z) - MAX_RANGE;
    const maxZ = Math.max(start.z, goal.z) + MAX_RANGE;

    const snap = v => Math.round(v / RES) * RES;
    const key = p => `${p.x},${p.y},${p.z}`;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

    const startNode = {x: snap(start.x), y: snap(start.y), z: snap(start.z)};
    const goalNode  = {x: snap(goal.x),  y: snap(goal.y),  z: snap(goal.z)};

    // 26方向鄰居（含斜角）
    const dirs = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++)
          if (dx || dy || dz) dirs.push([dx * RES, dy * RES, dz * RES]);

    const open = new Map();     // key -> {pos, g, f}
    const cameFrom = new Map(); // key -> parentKey
    const gScore = new Map();

    const startKey = key(startNode);
    open.set(startKey, {pos: startNode, g: 0, f: dist(startNode, goalNode)});
    gScore.set(startKey, 0);

    let expanded = 0;
    let reached = false;

    while (open.size > 0) {
      if (++expanded > MAX_NODES){logMessage("超過節點限制");return false;}

      // 取出 f 最小節點（節點數受限，線性掃描即可）
      let curKey = null, cur = null, bestF = Infinity;
      for (const [k, node] of open) {
        if (node.f < bestF) { bestF = node.f; curKey = k; cur = node; }
      }
      open.delete(curKey);

      // 夠接近終點，且能直線看到終點 -> 完成
      if (dist(cur.pos, goalNode) < RES && (await this.checkPath(cur.pos, goal))) {
        cameFrom.set(key(goal), curKey);
        reached = true;
        break;
      }

      for (const [dx, dy, dz] of dirs) {
        const nPos = {x: cur.pos.x + dx, y: cur.pos.y + dy, z: cur.pos.z + dz};
        if (nPos.x < minX || nPos.x > maxX || nPos.y < minY || nPos.y > maxY || nPos.z < minZ || nPos.z > maxZ) continue;
        const nKey = key(nPos);
        if (!(await this.checkPath(cur.pos, nPos))) continue; // 該邊被阻擋（含未載入區塊會被判為阻擋，交由你外層的重規劃機制處理）

        const tentativeG = cur.g + dist(cur.pos, nPos);
        if (gScore.get(nKey) === undefined || tentativeG < gScore.get(nKey)) {
          gScore.set(nKey, tentativeG);
          cameFrom.set(nKey, curKey);
          open.set(nKey, {pos: nPos, g: tentativeG, f: tentativeG + dist(nPos, goalNode)});
        }
      }
    }

    if(!reached){logMessage("無成功直達終點");return false;}

    // 3. 回溯出網格路徑
    const rawPath = [goal];
    let k = key(goal);
    while (cameFrom.has(k)) {
      k = cameFrom.get(k);
      const [px, py, pz] = k.split(",").map(Number);
      rawPath.unshift({x: px, y: py, z: pz});
    }
    rawPath.shift(); // 去掉網格化的起點（保留真實 start，由 simplifyPath 處理）

    // 4. 貪婪視線拉直，收斂成最少節點/最少轉彎的路徑
    return await this.simplifyPath(start, rawPath);
  }

  async simplifyPath(start, rawPath) {
    const full = [start, ...rawPath];
    const result = [];
    let i = 0;
    while (i < full.length - 1) {
      let j = full.length - 1;
      for (; j > i + 1; j--) {
        if (await this.checkPath(full[i], full[j])) break;
      }
      result.push(full[j]);
      i = j;
    }
    return result;
  }
  
  async materialGet(itemName,quantity,shulkerBoxes){
    //前往材料倉庫
    for(let i of materialPath){
      await this.goto(i);
    }
    //取得有材料的盒子
    const targ=shulkerBoxes[itemName];
    if(!targ)return false;
    //丟棄多餘物品
    await this.tossAllItems();
    //嘗試移動到盒子
    let count=0;
    this.fly(1);
    if(!await this.pathTo(targ.x,targ.y,targ.z,3)){
      toConsole("移動失敗");
      return false;
    }
    this.fly(0);
    //開箱子
    if(!this.bot.blockAt(targ))return 0;
    const block=this.bot.blockAt(targ);
    if(!block||!block.name.includes("shulker_box")){
      toConsole("箱子錯誤");
      return false;
    }
    const chest=await this.bot.openContainer(block);
    await wait(1000);
    const items=await chest.containerItems();
    //在材料清單的數量下，盡可能取出所有正確的物品
    for(let item of items){
      if(item.name!==itemName)continue;
      await this.bot.clickWindow(item.slot,0,1);
      if(quantity)quantity-=item.count;
      if(quantity<(0))break;
    }
    //關箱子
    await wait(500);
    chest.close(); 
    //回建造地
    for(let i of warpPath){
      await this.goto(i);
    }
    return true;
  }
  
  async findShulkers(){
    const blocks=this.bot.findBlocks({
      matching:(b)=>b.name.includes("shulker_box"),
      maxDistance:64,
      count:1000
    });
    const botPos=this.bot.entity.position;
    blocks.sort((a,b)=>botPos.distanceSquared(a)-botPos.distanceSquared(b));
    let shulkerBoxes={};
    //logMessage(blocks);
    for(let i of blocks){
      const block=this.bot.blockAt(new Vec3(i.x,i.y-5,i.z));
      //logMessage(block?.name);
      if(block?.name!=="air"&&!shulkerBoxes[block.name])shulkerBoxes[block.name]=i;
    }
    return shulkerBoxes;
  }
  
  async equipItem(blockName) {
    if(blockName&&this.bot.heldItem&&this.bot.heldItem.count>0&&this.bot.heldItem.name===blockName)return true;
    const items=this.bot.inventory.items();
    if(items.length===0)return false;
    let item={};
    if(!blockName)item=items.find(item=>item.count>0);
    else item=items.find(item=>item.name===blockName&&item.count>0);
    if(!item){
      logMessage("缺少物品："+(blockName||""));
      return false;
    }else{
      await this.bot.equip(item,"hand");
      return true;
    }
  }
  
  async tossAllItems(){
    const items=this.bot.inventory.items();
    for(const item of items){
      try{
        await this.bot.tossStack(item);//丟出整疊
      }catch(err){
        this.bot.chat(`丟出物品時出錯: ${err.message}`);
      }
    }
  }
  
  async textMoveTo(tx,ty,tz){
    if(!tx)tx="~0";
    if(!ty)ty="~0";
    if(!tz)tz="~0";
    const current=this.bot.entity.position.clone();
    const parseCoord=(t,current)=>t?(t.startsWith("~")?(current+(Number(t.slice(1))||0)):Number(t)):current;
    const x=parseCoord(tx.toString(),current.x);
    const y=parseCoord(ty.toString(),current.y);
    const z=parseCoord(tz.toString(),current.z);
    await this.moveTo(x,y,z);
  }
  async moveTo(x,y,z){
    const current=this.bot.entity.position.clone();
    const dx=x-current.x;
    const dy=y-current.y;
    const dz=z-current.z;
    const distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
    const maxStep=8;//原版限制是10
    for(let step=0;step<Math.floor(distance/maxStep);step++){
      this.bot._client.write("position",{
        x:current.x+dx/distance*maxStep*(step+1),
        y:current.y+dy/distance*maxStep*(step+1),
        z:current.z+dz/distance*maxStep*(step+1),
        yaw:this.bot.entity.yaw,
        pitch:this.bot.entity.pitch,
        onGround:true,//1.20
        flags:0x00//1.21
      });
      if(!fallout)await wait(60);//廢土不用
      else await wait(10);
    }
    this.bot._client.write("position",{
      x:x,
      y:y,
      z:z,
      yaw:this.bot.entity.yaw,
      pitch:this.bot.entity.pitch,
      onGround:true,
      flags:0x00
    });
    this.bot.entity.position.set(x,y,z);
    if(!fallout)await wait(60);//廢土不用
    else await wait(10);
  }
  
  fly(ifFlying){
    if(ifFlying)this.bot._client.write("abilities",{flags:0b0111,flyingSpeed:4.0,walkingSpeed:4.0});//flags:0b無敵、允許、飛行、創造
    else this.bot._client.write("abilities",{flags:0b0100,flyingSpeed:4.0,walkingSpeed:4.0});
  }
  
  checkPath(start,end) {
    // 1. 定義玩家碰撞箱的尺寸（寬 0.6，高 1.8）
    const wr=0.3;
    const h=1.8;
    const checkGrid=(x0,y0,z0,x1,y1,z1)=>{
      const dx=x1-x0,dy=y1-y0,dz=z1-z0;
      // 每跨一個格子，t 增加的量 —— 一定是正的
      const tDeltaX=dx!==0?Math.abs(1/dx):Infinity;
      const tDeltaY=dy!==0?Math.abs(1/dy):Infinity;
      const tDeltaZ=dz!==0?Math.abs(1/dz):Infinity;
      const stepX=dx>0?1:(dx<0?-1:0);
      const stepY=dy>0?1:(dy<0?-1:0);
      const stepZ=dz>0?1:(dz<0?-1:0);
      // 初始 tMax：走到下一個格線需要的 t（這部分原本就是對的，維持用有號的 1/d 算）
      let tMaxX=dx!==0?(Math.floor(x0)+(dx>0?1:0)-x0)*(1/dx):Infinity;
      let tMaxY=dy!==0?(Math.floor(y0)+(dy>0?1:0)-y0)*(1/dy):Infinity;
      let tMaxZ=dz!==0?(Math.floor(z0)+(dz>0?1:0)-z0)*(1/dz):Infinity;
      let x=Math.floor(x0),y=Math.floor(y0),z=Math.floor(z0);
      const endX=Math.floor(x1),endY=Math.floor(y1),endZ=Math.floor(z1);
      let block=this.bot.blockAt(new Vec3(x,y,z));
      /*if(block?.boundingBox!=="empty"){
        //logMessage(start+end);
        //logMessage(block);
        return false;
      }*///起始方塊忽略
      while(x!==endX||y!==endY||z!==endZ){
        let xp=0,yp=0,zp=0;
        if(tMaxX<=tMaxY&&tMaxX<=tMaxZ)xp++;
        if(tMaxY<=tMaxZ&&tMaxY<=tMaxX)yp++;
        if(tMaxZ<=tMaxX&&tMaxZ<=tMaxY)zp++;
        if(xp){x+=stepX;tMaxX+=tDeltaX;}
        if(yp){y+=stepY;tMaxY+=tDeltaY;}
        if(zp){z+=stepZ;tMaxZ+=tDeltaZ;}
        block=this.bot.blockAt(new Vec3(x,y,z));
        if(block&&block.boundingBox!=="empty"){
          //logMessage(start+end);
          //logMessage(block);
          return false;
        }
      }
      return true;
    };
    //x+-wr * z+-wr * y+0,+h/2,+h 碰撞箱分別在他們的xyz+還是-
    for(let x of [-wr,wr]){
      for(let z of [-wr,wr]){
        for(let y of [0,0.5*h,h]){
          if(checkGrid(start.x+x,start.y+y,start.z+z,end.x+x,end.y+y,end.z+z)===false)return false;
        }
      }
    }
    return true;
  }
//checkPath 53.5 56 -94.5 53.5 56 -100.5
/*
D:
cd mapBot
node mapBot_v0.1.js
*/

  placeBlock(tx,ty,tz,face) {
    const block=new Vec3(tx,ty,tz);
    if(!face)face=0;
    //if(this.bot.blockAt(block).name!=="air")return;
    const packetData={
      hand:0,
      location:block,
      direction:face,
      cursorX:0.5,
      cursorY:1.0,
      cursorZ:0.5,
      insideBlock:false,
      sequence:0
    };
    this.bot._client.write("block_place",packetData);
    if(this.bot.heldItem)this.bot.heldItem.count--;
  }
  async goto(i){
    await this.bot.chat(i.a);
    await this.waitForMessage(i.b);
    this.fly(0);
    await wait(1500);//等待完全載入
    this.bot.setControlState("sneak",true);
    await wait(50);
    await this.textMoveTo("~0.1","~","~0.1");
    await wait(50);
    this.bot.setControlState("sneak",false);
    await this.textMoveTo("~-0.1","~0.1","~-0.1");
    await wait(1500);
  }
  async waitForMessage(targetMessage, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      // 設定超時定時器
      const timer = setTimeout(() => {
        // 超時了，要把原本的 once 監聽器移除，避免後續觸發
        this.bot.removeListener('messagestr', messageHandler);
        reject(new Error(`等待訊息 [${targetMessage}] 超時`));
      }, timeoutMs);

      // 訊息處理函式
      const messageHandler = (msg) => {
        const isMatch = targetMessage instanceof RegExp 
          ? targetMessage.test(msg) 
          : msg.includes(targetMessage);

        if (isMatch) {
          clearTimeout(timer); // 清除超時計時
          resolve(msg);        // 回傳成功的訊息內容
        } else {
          // 如果不是我們要的訊息，因為用的是 once，必須手動重新監聽，直到超時或找到為止
          this.bot.once('messagestr', messageHandler);
        }
      };

      // 啟動第一次監聽
      this.bot.once('messagestr', messageHandler);
    });
  }
}
const myBot=new MCBot(); 

//終端機輸入
rl.on("line",(input)=>{
  readline.moveCursor(process.stdout,0,-1);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout,0);
  rl._refreshLine();
  if(myBot.working&&myBot.bot&&typeof myBot.bot.chat=="function"&&myBot.feedback(input))myBot.bot.chat(input);
});

//重複字串
function repeat(str,count){
  const times=Math.floor(Number(count))||0;
  if(times<=0)return "";
  if(times>1000){
  return str.repeat?str.repeat(1000):""
  }
  let result="";
  for(let i=0;i<times;i++){
  result+=str;
  }
  return result;
}

//等待定時間
function wait(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

//格式化時間為 HH:MM:SS
function formatTime(date){
  const hours=String(date.getHours()).padStart(2,"0");
  const minutes=String(date.getMinutes()).padStart(2,"0");
  const seconds=String(date.getSeconds()).padStart(2,"0");
  const milliseconds=String(date.getMilliseconds()).padStart(3,"0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

//輸出指定內容、加上時間與紅字
function toConsole(data,ac){
  if(!ac)logMessage(`[${formatTime(new Date)}] ${!ac?"\x1b[0;91m":""}${data.toString()}\x1b[0m`);
}

function logMessage(msg){
  process.stdout.write("\r\x1b[K");
  console.log(msg);
  rl._refreshLine();
}

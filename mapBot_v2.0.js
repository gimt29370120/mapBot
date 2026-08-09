"use strict";
const mineflayer=require("mineflayer");//Minecraft機器人API
const Vec3=require("vec3");//用於建立座標物件
//const {exec}=require("child_process");//用於執行新任務
const fs=require("fs");//用於檔案讀寫
const readline=require("readline");//讀取終端機
const nbt = require("prismarine-nbt");//讀取nbt檔案 往xyz軸正向發展
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

const inputFile=fs.readFileSync("./Amitabha1.nbt");//輸入的nbt檔

const referencePoint=[-2368,100,6079];//地圖左上角，往北一格，建築將會往x+,y+,z+發展[64,56,-65]
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
  username:"gimt29370120@outlook.com",
  version:"1.21.11",//登入使用的Minecraft版本，有些版本會導致錯誤"1.21.11"1.20.4
  hideErrors:false,//true->隱藏錯誤
  physicsEnabled:false//false停用物理規則
};

const blockReplace={//方塊替換清單
  "minecraft:grass_block":"minecraft:slime_block",
  "minecraft:cobweb":"minecraft:mushroom_stem",
  "minecraft:sand":"minecraft:glowstone",
  "minecraft:sandstone":"minecraft:glowstone",
  "minecraft:birch_planks":"minecraft:glowstone",
  "minecraft:birch_slab":"minecraft:glowstone",
  "minecraft:end_stone":"minecraft:glowstone",
  "minecraft:ochre_froglight":"minecraft:glowstone",
  "minecraft:tnt":"minecraft:redstone_block",
  "minecraft:ice":"minecraft:packed_ice",
  "minecraft:iron_block":"minecraft:iron_trapdoor",
  "minecraft:oak_leaves":"minecraft:bamboo_block",
  "minecraft:jungle_log":"minecraft:jungle_planks",
  "minecraft:jungle_slab":"minecraft:jungle_planks",
  "minecraft:oak_log":"minecraft:oak_planks",
  "minecraft:oak_slab":"minecraft:oak_planks",
  //"minecraft:birch_log":"minecraft:quartz_block",
  "minecraft:sea_lantern":"minecraft:quartz_block",
  "minecraft:quartz_slab":"minecraft:quartz_block",
  "minecraft:diamond_block":"minecraft:prismarine_bricks",
  "minecraft:spruce_log":"minecraft:spruce_planks",
  "minecraft:spruce_slab":"minecraft:spruce_planks",
  "minecraft:crimson_stem":"minecraft:crimson_planks",
  "minecraft:crimson_slab":"minecraft:crimson_planks",
  "minecraft:warped_stem":"minecraft:warped_planks",
  "minecraft:warped_slab":"minecraft:warped_planks",
  "minecraft:cobbled_deepslate":"minecraft:deepslate",
  "minecraft:cobbled_deepslate_slab":"minecraft:deepslate",
  "minecraft:glow_lichen":"minecraft:verdant_froglight",
  "minecraft:glass":"minecraft:glass_pane",
  "minecraft:cobblestone_slab":"minecraft:cobblestone",
  "minecraft:netherrack":"minecraft:magma_block",
  "minecraft:white_terracotta":"minecraft:cherry_planks",
  };//替換方塊清單

async function decodeNBT() {
  // 解析 NBT
  const {parsed}=await nbt.parse(inputFile);
  let data=nbt.simplify(parsed);
  data.blocks.sort((a,b)=>a.state-b.state);//依方塊種類整理
  data.palette=data.palette.map(item=>{
    if (blockReplace[item.Name])return{...item,Name:blockReplace[item.Name]};
    return item;
  });
  logMessage(data.palette);
  return data;
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
      toConsole(`機器人已登入到 ${botSocket.server||botSocket._host}`);
      this.fly(0);//降落
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
    this.bot.on("forcedMove",(movewrong)=>{
      toConsole("移動錯誤");
      //this.bot.quit();
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
    const mapData=await decodeNBT();
    //初始索引值
    n=Number(n)||0;
    //頂部確定
    const top=referencePoint[1]+mapData.size[1];
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
    //建立所需材料清單
    for(let i=0;i<mapData.blocks.length;i++){
      let name=mapData.palette[mapData.blocks[i].state].Name.replace("minecraft:","");
      if(!name){
        toConsole("序列錯誤於索引值："+i);
        return;
      }
      //目標位置、若有方塊則跳過
      let x=mapData.blocks[i].pos[0]+referencePoint[0];
      let y=mapData.blocks[i].pos[1]+referencePoint[1];
      let z=mapData.blocks[i].pos[2]+referencePoint[2];
      if(this.bot.blockAt(new Vec3(x,y,z))?.name!=="air")continue;
      //材料+1
      this.materialList[name]=(this.materialList[name]??0)+1;
    }
    logMessage(this.materialList);
    //開始建造
    for(let i=n;i<mapData.blocks.length;i++){
      while(!this.working)return;
      //材料名稱
      let name=mapData.palette[mapData.blocks[i].state].Name.replace("minecraft:","");
      //目標位置、若有方塊則跳過
      let x=mapData.blocks[i].pos[0]+referencePoint[0];
      let y=mapData.blocks[i].pos[1]+referencePoint[1];
      let z=mapData.blocks[i].pos[2]+referencePoint[2];
      //this.bot.chat(`/setblock ${x} ${y} ${z} ${name}${mapData.palette[mapData.blocks[i].state].Properties?.axis?`[axis="${mapData.palette[mapData.blocks[i].state].Properties.axis}"]`:""}`);
      
      if(this.bot.blockAt(new Vec3(x,y,z))?.name!=="air")continue;
      logMessage("目前索引值："+i+"/"+(mapData.blocks.length-1)+"："+`${x},${y},${z}`);//\x1b[1F\x1b[2K
      //材料方向，特別用於原木
      let face=1;
      switch(mapData.palette[mapData.blocks[i].state].Properties?.axis){
        case "x":face=4;break;
        case "z":face=2;break;
        default:face=1;
      }
      //取得物品
      logMessage("取得物品");
      await this.equipItem(name);
      if(this.bot.heldItem?.name!=name){
        //await wait(60);//緩衝前一步的放置
        //身上沒有物品->嘗試從倉庫取得物品
        if(await this.equipItem(name)==false){
          if(!await this.materialGet(name,shulkerBoxes)){
            toConsole("程序中斷於索引值："+i+"，找不到倉庫："+name);
            return;
          }else{
            if(await this.equipItem(name)==false){
              logMessage("程序中斷於索引值："+i+"，物品失敗");
              return;
            }
          }
        }
      }
      //嘗試移動到建造目標
      logMessage("嘗試移動到建造目標");
      let pos=this.bot.entity.position.floored().offset(0.5,0,0.5);
      this.fly(1);
      await this.moveTo(pos.x,pos.y,pos.z);
      if(this.bot.entity.position.distanceSquared(new Vec3(x+0.5,y+1,z+0.5))>9){
        if(!await this.pathTo(x,y,z,3)){
          logMessage("目前位置："+this.bot.entity.position);
          toConsole("程序中斷於索引值："+i+"，找不到路徑");
          continue;
        }
      }
      this.fly(0);
      //放置方塊
      logMessage("放置方塊");
      await wait(30);
      let count=0;
      while(!this.bot.blockAt(new Vec3(x,y,z))?.boundingBox&&count<50){
        await wait(60);
        count++;
        logMessage(this.bot.blockAt(new Vec3(x,y,z)));
      }
      //logMessage(this.bot.blockAt(new Vec3(x,y,z)));
      //if(this.bot.blockAt(new Vec3(x,y,z)).name!=="air")return;
      await this.placeBlock(x,y,z,face);
      //await wait(60);
      /*let count=0;
      while(this.bot.blockAt(new Vec3(x,y,z))?.name==="air"&&count<10){
        await this.placeBlock(x,y,z,face);
        await wait(100);
        count++;
      }*/
    }
  }
  
  //尋找路徑&前往特定方塊座標
  async pathTo(x,y,z,d){
    d=0.1;
    if(this.bot.entity.position.distanceSquared(new Vec3(x,y,z))<=d*d)return true;
    let targ=new Vec3(x+0.5,y+1,z+0.5)
    let pos={};
    let path={};
    let count=0;
    while(this.bot.entity.position.distanceSquared(targ)>d*d){
      pos=this.bot.entity.position.clone();
      path=await this.findPath(pos,targ.x,targ.y,targ.z);
      if(path===false){toConsole("尋找路徑失敗");return false;}
      for(let j of path){
        await this.moveTo(j.x,j.y,j.z);
      }
      count++;
      if(count===2)targ=new Vec3(x,y+1,z);
      if(count>10){toConsole("移動失敗次數超過");return false;}
      //await wait(70);
    }
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
  
  async materialGet(itemName,shulkerBoxes){
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
    const chest=await this.bot.openContainer(this.bot.blockAt(targ));
    await wait(1000);
    const items=await chest.containerItems();
    //在材料清單的數量下，盡可能取出所有正確的物品
    for(let item of items){
      //logMessage(this.materialList[itemName]);
      //logMessage(item);
      //logMessage(itemName);
      if(item.name!==itemName)continue;
      await this.bot.clickWindow(item.slot,0,1);
      if(this.materialList[itemName])this.materialList[itemName]-=item.count;
      if(this.materialList[itemName]<(0-64))break;
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
    if(ifFlying)this.bot._client.write("abilities",{flags:0b0000,flyingSpeed:4.0,walkingSpeed:4.0});//flags:0b無敵、允許、飛行、創造
    else this.bot._client.write("abilities",{flags:0b0000,flyingSpeed:4.0,walkingSpeed:4.0});
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
    const packetData = {
      hand:0,
      location:block,
      direction:face,
      cursorX:0.5,
      cursorY:1.0,
      cursorZ:0.5,
      insideBlock:false,
      sequence:0
    };
    this.bot._client.write("block_place", packetData);
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

const depth=process.stdout.getColorDepth();//檢查色彩深度
const reset="\x1b[0m"+(depth>=8?"\x1b[38;5;231m":"\x1b[0;97m");//\x1b[0m
//輸出指定內容、加上時間與紅字
function toConsole(data,ac){
  if(!ac)logMessage(`[${formatTime(new Date)}] ${!ac?"\x1b[0;91m":""}${data.toString()}\x1b[0m`);
}

function logMessage(msg){
  process.stdout.write("\r\x1b[K");
  console.log(msg);
  rl._refreshLine();
}

//寫了很久的終端機彩色文字
function colorMessage(chatMessage){
  //定義可接受的Hex顏色碼
  let validHexCodes=[
    "#000000","#0000AA","#00AA00","#00AAAA",
    "#AA0000","#AA00AA","#AA5500","#AAAAAA",
    "#555555","#5555FF","#55FF55","#55FFFF",
    "#FF5555","#FF55FF","#FFFF55","#FFFFFF"
  ];
  if(depth===8)validHexCodes=[
    // 1. 基礎 16 色系統色彩 (0 - 15)
    "#000000","#800000","#008000","#808000","#000080","#800080","#008080","#C0C0C0",
    "#808080","#FF0000","#00FF00","#FFFF00","#0000FF","#FF00FF","#00FFFF","#FFFFFF",
    // 2. 216 色彩方塊 (16 - 231)
    "#000000","#00005F","#000087","#0000AF","#0000D7","#0000FF",
    "#005F00","#005F5F","#005F87","#005FAF","#005FD7","#005FFF",
    "#008700","#00875F","#008787","#0087AF","#0087D7","#0087FF",
    "#00AF00","#00AF5F","#00AF87","#00AFAF","#00AFD7","#00AFFF",
    "#00D700","#00D75F","#00D787","#00D7AF","#00D7D7","#00D7FF",
    "#00FF00","#00FF5F","#00FF87","#00FFAF","#00FFD7","#00FFFF",
    "#5F0000","#5F005F","#5F0087","#5F00AF","#5F00D7","#5F00FF",
    "#5F5F00","#5F5F5F","#5F5F87","#5F5FAF","#5F5FD7","#5F5FFF",
    "#5F8700","#5F875F","#5F8787","#5F87AF","#5F87D7","#5F87FF",
    "#5FAF00","#5FAF5F","#5FAF87","#5FAFAF","#5FAFD7","#5FAFFF",
    "#5FD700","#5FD75F","#5FD787","#5FD7AF","#5FD7D7","#5FD7FF",
    "#5FFF00","#5FFF5F","#5FFF87","#5FFFAF","#5FFFD7","#5FFFFF",
    "#870000","#87005F","#870087","#8700AF","#8700D7","#8700FF",
    "#875F00","#875F5F","#875F87","#875FAF","#875FD7","#875FFF",
    "#878700","#87875F","#878787","#8787AF","#8787D7","#8787FF",
    "#87AF00","#87AF5F","#87AF87","#87AFAF","#87AFD7","#87AFFF",
    "#87D700","#87D75F","#87D787","#87D7AF","#87D7D7","#87D7FF",
    "#87FF00","#87FF5F","#87FF87","#87FFAF","#87FFD7","#87FFFF",
    "#AF0000","#AF005F","#AF0087","#AF00AF","#AF00D7","#AF00FF",
    "#AF5F00","#AF5F5F","#AF5F87","#AF5FAF","#AF5FD7","#AF5FFF",
    "#AF8700","#AF875F","#AF8787","#AF87AF","#AF87D7","#AF87FF",
    "#AFAF00","#AFAF5F","#AFAF87","#AFAFAF","#AFAFD7","#AFAFFF",
    "#AFD700","#AFD75F","#AFD787","#AFD7AF","#AFD7D7","#AFD7FF",
    "#AFFF00","#AFFF5F","#AFFF87","#AFFFAF","#AFFFD7","#AFFFFF",
    "#D70000","#D7005F","#D70087","#D700AF","#D700D7","#D700FF",
    "#D75F00","#D75F5F","#D75F87","#D75FAF","#D75FD7","#D75FFF",
    "#D78700","#D7875F","#D78787","#D787AF","#D787D7","#D787FF",
    "#D7AF00","#D7AF5F","#D7AF87","#D7AFAF","#D7AFD7","#D7AFFF",
    "#D7D700","#D7D75F","#D7D787","#D7D7AF","#D7D7D7","#D7D7FF",
    "#D7FF00","#D7FF5F","#D7FF87","#D7FFAF","#D7FFD7","#D7FFFF",
    "#FF0000","#FF005F","#FF0087","#FF00AF","#FF00D7","#FF00FF",
    "#FF5F00","#FF5F5F","#FF5F87","#FF5FAF","#FF5FD7","#FF5FFF",
    "#FF8700","#FF875F","#FF8787","#FF87AF","#FF87D7","#FF87FF",
    "#FFAF00","#FFAF5F","#FFAF87","#FFAFAF","#FFAFD7","#FFAFFF",
    "#FFD700","#FFD75F","#FFD787","#FFD7AF","#FFD7D7","#FFD7FF",
    "#FFFF00","#FFFF5F","#FFFF87","#FFFFAF","#FFFFD7","#FFFFFF",
    // 3. 24 階連續灰階 (232 - 255)
    "#080808","#121212","#1C1C1C","#262626","#303030","#3A3A3A",
    "#444444","#4E4E4E","#585858","#626262","#6C6C6C","#767676",
    "#808080","#8A8A8A","#949494","#9E9E9E","#A8A8A8","#B2B2B2",
    "#BCBCBC","#C6C6C6","#D0D0D0","#DADADA","#E4E4E4","#EEEEEE"
  ];

  //Minecraft顏色代碼到ANSI的對應表
  let colorToAnsi={
    "black":"\x1b[0;30m",
    "dark_blue":"\x1b[0;34m",
    "dark_green":"\x1b[0;32m",
    "dark_aqua":"\x1b[0;36m",
    "dark_red":"\x1b[0;31m",
    "dark_purple":"\x1b[0;35m",
    "gold":"\x1b[0;33m",
    "gray":"\x1b[0;37m",
    "dark_gray":"\x1b[0;90m",
    "blue":"\x1b[0;94m",
    "green":"\x1b[0;92m",
    "aqua":"\x1b[0;96m",
    "red":"\x1b[0;91m",
    "light_purple":"\x1b[0;95m",
    "yellow":"\x1b[0;93m",
    "white":"\x1b[0;97m",
    "#000000":"\x1b[0;30m",
    "#0000AA":"\x1b[0;34m",
    "#00AA00":"\x1b[0;32m",
    "#00AAAA":"\x1b[0;36m",
    "#AA0000":"\x1b[0;31m",
    "#AA00AA":"\x1b[0;35m",
    "#AA5500":"\x1b[0;33m",
    "#AAAAAA":"\x1b[0;37m",
    "#555555":"\x1b[0;90m",
    "#5555FF":"\x1b[0;94m",
    "#55FF55":"\x1b[0;92m",
    "#55FFFF":"\x1b[0;96m",
    "#FF5555":"\x1b[0;91m",
    "#FF55FF":"\x1b[0;95m",
    "#FFFF55":"\x1b[0;93m",
    "#FFFFFF":"\x1b[0;97m"
  };
  if(depth===8)colorToAnsi={
    "black":"\x1b[0;30m",
    "dark_blue":"\x1b[0;34m",
    "dark_green":"\x1b[0;32m",
    "dark_aqua":"\x1b[0;36m",
    "dark_red":"\x1b[0;31m",
    "dark_purple":"\x1b[0;35m",
    "gold":"\x1b[0;33m",
    "gray":"\x1b[0;37m",
    "dark_gray":"\x1b[0;90m",
    "blue":"\x1b[0;94m",
    "green":"\x1b[0;92m",
    "aqua":"\x1b[0;96m",
    "red":"\x1b[0;91m",
    "light_purple":"\x1b[0;95m",
    "yellow":"\x1b[0;93m",
    "white":"\x1b[0;97m",
    //--------------------------------------------------------------------
    "#000000":"\x1b[38;5;0m","#800000":"\x1b[38;5;1m","#008000":"\x1b[38;5;2m","#808000":"\x1b[38;5;3m",
    "#000080":"\x1b[38;5;4m","#800080":"\x1b[38;5;5m","#008080":"\x1b[38;5;6m","#C0C0C0":"\x1b[38;5;7m",
    "#808080":"\x1b[38;5;8m","#FF0000":"\x1b[38;5;9m","#00FF00":"\x1b[38;5;10m","#FFFF00":"\x1b[38;5;11m",
    "#0000FF":"\x1b[38;5;12m","#FF00FF":"\x1b[38;5;13m","#00FFFF":"\x1b[38;5;14m","#FFFFFF":"\x1b[38;5;15m",
    // 2. 216 色彩方塊 (16 - 231)
    "#000000":"\x1b[38;5;16m","#00005F":"\x1b[38;5;17m","#000087":"\x1b[38;5;18m","#0000AF":"\x1b[38;5;19m","#0000D7":"\x1b[38;5;20m","#0000FF":"\x1b[38;5;21m",
    "#005F00":"\x1b[38;5;22m","#005F5F":"\x1b[38;5;23m","#005F87":"\x1b[38;5;24m","#005FAF":"\x1b[38;5;25m","#005FD7":"\x1b[38;5;26m","#005FFF":"\x1b[38;5;27m",
    "#008700":"\x1b[38;5;28m","#00875F":"\x1b[38;5;29m","#008787":"\x1b[38;5;30m","#0087AF":"\x1b[38;5;31m","#0087D7":"\x1b[38;5;32m","#0087FF":"\x1b[38;5;33m",
    "#00AF00":"\x1b[38;5;34m","#00AF5F":"\x1b[38;5;35m","#00AF87":"\x1b[38;5;36m","#00AFAF":"\x1b[38;5;37m","#00AFD7":"\x1b[38;5;38m","#00AFFF":"\x1b[38;5;39m",
    "#00D700":"\x1b[38;5;40m","#00D75F":"\x1b[38;5;41m","#00D787":"\x1b[38;5;42m","#00D7AF":"\x1b[38;5;43m","#00D7D7":"\x1b[38;5;44m","#00D7FF":"\x1b[38;5;45m",
    "#00FF00":"\x1b[38;5;46m","#00FF5F":"\x1b[38;5;47m","#00FF87":"\x1b[38;5;48m","#00FFAF":"\x1b[38;5;49m","#00FFD7":"\x1b[38;5;50m","#00FFFF":"\x1b[38;5;51m",
    "#5F0000":"\x1b[38;5;52m","#5F005F":"\x1b[38;5;53m","#5F0087":"\x1b[38;5;54m","#5F00AF":"\x1b[38;5;55m","#5F00D7":"\x1b[38;5;56m","#5F00FF":"\x1b[38;5;57m",
    "#5F5F00":"\x1b[38;5;58m","#5F5F5F":"\x1b[38;5;59m","#5F5F87":"\x1b[38;5;60m","#5F5FAF":"\x1b[38;5;61m","#5F5FD7":"\x1b[38;5;62m","#5F5FFF":"\x1b[38;5;63m",
    "#5F8700":"\x1b[38;5;64m","#5F875F":"\x1b[38;5;65m","#5F8787":"\x1b[38;5;66m","#5F87AF":"\x1b[38;5;67m","#5F87D7":"\x1b[38;5;68m","#5F87FF":"\x1b[38;5;69m",
    "#5FAF00":"\x1b[38;5;70m","#5FAF5F":"\x1b[38;5;71m","#5FAF87":"\x1b[38;5;72m","#5FAFAF":"\x1b[38;5;73m","#5FAFD7":"\x1b[38;5;74m","#5FAFFF":"\x1b[38;5;75m",
    "#5FD700":"\x1b[38;5;76m","#5FD75F":"\x1b[38;5;77m","#5FD787":"\x1b[38;5;78m","#5FD7AF":"\x1b[38;5;79m","#5FD7D7":"\x1b[38;5;80m","#5FD7FF":"\x1b[38;5;81m",
    "#5FFF00":"\x1b[38;5;82m","#5FFF5F":"\x1b[38;5;83m","#5FFF87":"\x1b[38;5;84m","#5FFFAF":"\x1b[38;5;85m","#5FFFD7":"\x1b[38;5;86m","#5FFFFF":"\x1b[38;5;87m",
    "#870000":"\x1b[38;5;88m","#87005F":"\x1b[38;5;89m","#870087":"\x1b[38;5;90m","#8700AF":"\x1b[38;5;91m","#8700D7":"\x1b[38;5;92m","#8700FF":"\x1b[38;5;93m",
    "#875F00":"\x1b[38;5;94m","#875F5F":"\x1b[38;5;95m","#875F87":"\x1b[38;5;96m","#875FAF":"\x1b[38;5;97m","#875FD7":"\x1b[38;5;98m","#875FFF":"\x1b[38;5;99m",
    "#878700":"\x1b[38;5;100m","#87875F":"\x1b[38;5;101m","#878787":"\x1b[38;5;102m","#8787AF":"\x1b[38;5;103m","#8787D7":"\x1b[38;5;104m","#8787FF":"\x1b[38;5;105m",
    "#87AF00":"\x1b[38;5;106m","#87AF5F":"\x1b[38;5;107m","#87AF87":"\x1b[38;5;108m","#87AFAF":"\x1b[38;5;109m","#87AFD7":"\x1b[38;5;110m","#87AFFF":"\x1b[38;5;111m",
    "#87D700":"\x1b[38;5;112m","#87D75F":"\x1b[38;5;113m","#87D787":"\x1b[38;5;114m","#87D7AF":"\x1b[38;5;115m","#87D7D7":"\x1b[38;5;116m","#87D7FF":"\x1b[38;5;117m",
    "#87FF00":"\x1b[38;5;118m","#87FF5F":"\x1b[38;5;119m","#87FF87":"\x1b[38;5;120m","#87FFAF":"\x1b[38;5;121m","#87FFD7":"\x1b[38;5;122m","#87FFFF":"\x1b[38;5;123m",
    "#AF0000":"\x1b[38;5;124m","#AF005F":"\x1b[38;5;125m","#AF0087":"\x1b[38;5;126m","#AF00AF":"\x1b[38;5;127m","#AF00D7":"\x1b[38;5;128m","#AF00FF":"\x1b[38;5;129m",
    "#AF5F00":"\x1b[38;5;130m","#AF5F5F":"\x1b[38;5;131m","#AF5F87":"\x1b[38;5;132m","#AF5FAF":"\x1b[38;5;133m","#AF5FD7":"\x1b[38;5;134m","#AF5FFF":"\x1b[38;5;135m",
    "#AF8700":"\x1b[38;5;136m","#AF875F":"\x1b[38;5;137m","#AF8787":"\x1b[38;5;138m","#AF87AF":"\x1b[38;5;139m","#AF87D7":"\x1b[38;5;140m","#AF87FF":"\x1b[38;5;141m",
    "#AFAF00":"\x1b[38;5;142m","#AFAF5F":"\x1b[38;5;143m","#AFAF87":"\x1b[38;5;144m","#AFAFAF":"\x1b[38;5;145m","#AFAFD7":"\x1b[38;5;146m","#AFAFFF":"\x1b[38;5;147m",
    "#AFD700":"\x1b[38;5;148m","#AFD75F":"\x1b[38;5;149m","#AFD787":"\x1b[38;5;150m","#AFD7AF":"\x1b[38;5;151m","#AFD7D7":"\x1b[38;5;152m","#AFD7FF":"\x1b[38;5;153m",
    "#AFFF00":"\x1b[38;5;154m","#AFFF5F":"\x1b[38;5;155m","#AFFF87":"\x1b[38;5;156m","#AFFFAF":"\x1b[38;5;157m","#AFFFD7":"\x1b[38;5;158m","#AFFFFF":"\x1b[38;5;159m",
    "#D70000":"\x1b[38;5;160m","#D7005F":"\x1b[38;5;161m","#D70087":"\x1b[38;5;162m","#D700AF":"\x1b[38;5;163m","#D700D7":"\x1b[38;5;164m","#D700FF":"\x1b[38;5;165m",
    "#D75F00":"\x1b[38;5;166m","#D75F5F":"\x1b[38;5;167m","#D75F87":"\x1b[38;5;168m","#D75FAF":"\x1b[38;5;169m","#D75FD7":"\x1b[38;5;170m","#D75FFF":"\x1b[38;5;171m",
    "#D78700":"\x1b[38;5;172m","#D7875F":"\x1b[38;5;173m","#D78787":"\x1b[38;5;174m","#D787AF":"\x1b[38;5;175m","#D787D7":"\x1b[38;5;176m","#D787FF":"\x1b[38;5;177m",
    "#D7AF00":"\x1b[38;5;178m","#D7AF5F":"\x1b[38;5;179m","#D7AF87":"\x1b[38;5;180m","#D7AFAF":"\x1b[38;5;181m","#D7AFD7":"\x1b[38;5;182m","#D7AFFF":"\x1b[38;5;183m",
    "#D7D700":"\x1b[38;5;184m","#D7D75F":"\x1b[38;5;185m","#D7D787":"\x1b[38;5;186m","#D7D7AF":"\x1b[38;5;187m","#D7D7D7":"\x1b[38;5;188m","#D7D7FF":"\x1b[38;5;189m",
    "#D7FF00":"\x1b[38;5;190m","#D7FF5F":"\x1b[38;5;191m","#D7FF87":"\x1b[38;5;192m","#D7FFAF":"\x1b[38;5;193m","#D7FFD7":"\x1b[38;5;194m","#D7FFFF":"\x1b[38;5;195m",
    "#FF0000":"\x1b[38;5;196m","#FF005F":"\x1b[38;5;197m","#FF0087":"\x1b[38;5;198m","#FF00AF":"\x1b[38;5;199m","#FF00D7":"\x1b[38;5;200m","#FF00FF":"\x1b[38;5;201m",
    "#FF5F00":"\x1b[38;5;202m","#FF5F5F":"\x1b[38;5;203m","#FF5F87":"\x1b[38;5;204m","#FF5FAF":"\x1b[38;5;205m","#FF5FD7":"\x1b[38;5;206m","#FF5FFF":"\x1b[38;5;207m",
    "#FF8700":"\x1b[38;5;208m","#FF875F":"\x1b[38;5;209m","#FF8787":"\x1b[38;5;210m","#FF87AF":"\x1b[38;5;211m","#FF87D7":"\x1b[38;5;212m","#FF87FF":"\x1b[38;5;213m",
    "#FFAF00":"\x1b[38;5;214m","#FFAF5F":"\x1b[38;5;215m","#FFAF87":"\x1b[38;5;216m","#FFAFAF":"\x1b[38;5;217m","#FFAFD7":"\x1b[38;5;218m","#FFAFFF":"\x1b[38;5;219m",
    "#FFD700":"\x1b[38;5;220m","#FFD75F":"\x1b[38;5;221m","#FFD787":"\x1b[38;5;222m","#FFD7AF":"\x1b[38;5;223m","#FFD7D7":"\x1b[38;5;224m","#FFD7FF":"\x1b[38;5;225m",
    "#FFFF00":"\x1b[38;5;226m","#FFFF5F":"\x1b[38;5;227m","#FFFF87":"\x1b[38;5;228m","#FFFFAF":"\x1b[38;5;229m","#FFFFD7":"\x1b[38;5;230m","#FFFFFF":"\x1b[38;5;231m",
    // 3. 24 階連續灰階 (232 - 255)
    "#080808":"\x1b[38;5;232m","#121212":"\x1b[38;5;233m","#1C1C1C":"\x1b[38;5;234m","#262626":"\x1b[38;5;235m",
    "#303030":"\x1b[38;5;236m","#3A3A3A":"\x1b[38;5;237m","#444444":"\x1b[38;5;238m","#4E4E4E":"\x1b[38;5;239m",
    "#585858":"\x1b[38;5;240m","#626262":"\x1b[38;5;241m","#6C6C6C":"\x1b[38;5;242m","#767676":"\x1b[38;5;243m",
    "#808080":"\x1b[38;5;244m","#8A8A8A":"\x1b[38;5;245m","#949494":"\x1b[38;5;246m","#9E9E9E":"\x1b[38;5;247m",
    "#A8A8A8":"\x1b[38;5;248m","#B2B2B2":"\x1b[38;5;249m","#BCBCBC":"\x1b[38;5;250m","#C6C6C6":"\x1b[38;5;251m",
    "#D0D0D0":"\x1b[38;5;252m","#DADADA":"\x1b[38;5;253m","#E4E4E4":"\x1b[38;5;254m","#EEEEEE":"\x1b[38;5;255m"
    //--------------------------------------------------------------------
  };
  if(depth===24)colorToAnsi={
    "black":"\x1b[38;2;0;0;0m",// black
    "dark_blue":"\x1b[38;2;0;0;170m",
    "dark_green":"\x1b[38;2;0;170;0m",
    "dark_aqua":"\x1b[38;2;0;170;170m",
    "dark_red":"\x1b[38;2;170;0;0m",
    "dark_purple":"\x1b[38;2;170;0;170m",
    "gold":"\x1b[38;2;255;170;0m",
    "gray":"\x1b[38;2;170;170;170m",
    "dark_gray":"\x1b[38;2;85;85;85m",
    "blue":"\x1b[38;2;85;85;255m",
    "green":"\x1b[38;2;85;255;85m",
    "aqua":"\x1b[38;2;85;255;255m",
    "red":"\x1b[38;2;255;85;85m",
    "light_purple":"\x1b[38;2;255;85;255m",
    "yellow":"\x1b[38;2;255;255;85m",
    "white":"\x1b[38;2;255;255;255m",
  };

  let sectToAnsi={
    "0":"\x1b[0;30m",// black
    "1":"\x1b[0;34m",// dark_blue
    "2":"\x1b[0;32m",// dark_green
    "3":"\x1b[0;36m",// dark_aqua
    "4":"\x1b[0;31m",// dark_red
    "5":"\x1b[0;35m",// dark_purple
    "6":"\x1b[0;33m",// gold
    "7":"\x1b[0;37m",// gray
    "8":"\x1b[0;90m",// dark_gray
    "9":"\x1b[0;94m",// blue
    "a":"\x1b[0;92m",// green
    "b":"\x1b[0;96m",// aqua
    "c":"\x1b[0;91m",// red
    "d":"\x1b[0;95m",// light_purple
    "e":"\x1b[0;93m",// yellow
    "f":"\x1b[0;97m",// white
    "k":"\x1b[8m",
    "l":"\x1b[1m",
    "m":"\x1b[9m",
    "n":"\x1b[4m",
    "o":"\x1b[3m",
    //"r":"\x1b[0m",
  }
  if(depth===8){
    sectToAnsi={
      "0":"\x1b[38;5;16m",// black
      "1":"\x1b[38;5;19m",// dark_blue
      "2":"\x1b[38;5;34m",// dark_green
      "3":"\x1b[38;5;37m",// dark_aqua
      "4":"\x1b[38;5;124m",// dark_red
      "5":"\x1b[38;5;127m",// dark_purple
      "6":"\x1b[38;5;214m",// gold
      "7":"\x1b[38;5;248m",// gray
      "8":"\x1b[38;5;240m",// dark_gray
      "9":"\x1b[38;5;63m",// blue
      "a":"\x1b[38;5;83m",// green
      "b":"\x1b[38;5;87m",// aqua
      "c":"\x1b[38;5;203m",// red
      "d":"\x1b[38;5;207m",// light_purple
      "e":"\x1b[38;5;227m",// yellow
      "f":"\x1b[38;5;231m",// white
      "k":"\x1b[8m",
      "l":"\x1b[1m",
      "m":"\x1b[9m",
      "n":"\x1b[4m",
      "o":"\x1b[3m",
      //"r":"\x1b[0m",
    }
  }
  if(depth===24){
    sectToAnsi={
      "0":"\x1b[38;2;0;0;0m",// black
      "1":"\x1b[38;2;0;0;170m",// dark_blue
      "2":"\x1b[38;2;0;170;0m",// dark_green
      "3":"\x1b[38;2;0;170;170m",// dark_aqua
      "4":"\x1b[38;2;170;0;0m",// dark_red
      "5":"\x1b[38;2;170;0;170m",// dark_purple
      "6":"\x1b[38;2;255;170;0m",// gold
      "7":"\x1b[38;2;170;170;170m",// gray
      "8":"\x1b[38;2;85;85;85m",// dark_gray
      "9":"\x1b[38;2;85;85;255m",// blue
      "a":"\x1b[38;2;85;255;85m",// green
      "b":"\x1b[38;2;85;255;255m",// aqua
      "c":"\x1b[38;2;255;85;85m",// red
      "d":"\x1b[38;2;255;85;255m",// light_purple
      "e":"\x1b[38;2;255;255;85m",// yellow
      "f":"\x1b[38;2;255;255;255m",// white
      "k":"\x1b[8m",
      "l":"\x1b[1m",
      "m":"\x1b[9m",
      "n":"\x1b[4m",
      "o":"\x1b[3m",
      //"r":"\x1b[0m",
    }
  }

  //樣式代碼對應的ANSI代碼
  const stylesToAnsi={
    bold:"\x1b[1m",
    italic:"\x1b[3m",
    underlined:"\x1b[4m",
    strikethrough:"\x1b[9m",
    obfuscated:"\x1b[8m",
  };
  
  //函數將輸入的Hex顏色碼轉換為有效的Hex顏色碼
  function convertToValidHex(inputHex){
    //將輸入的Hex顏色碼轉換成最接近的有效Hex顏色碼
    if(validHexCodes.includes(inputHex))return inputHex;
    let closestHex=validHexCodes[0];
    let minDiff=Infinity;
    for(const validHex of validHexCodes){
      const bigint1=parseInt(inputHex.slice(1),16);
      const rgb1=[(bigint1>>16)&255,(bigint1>>8)&255,bigint1&255];
      const bigint2=parseInt(validHex.slice(1),16);
      const rgb2=[(bigint2>>16)&255,(bigint2>>8)&255,bigint2&255];
      const diff=
        Math.pow(rgb1[0]-rgb2[0],2)+
        Math.pow(rgb1[1]-rgb2[1],2)+
        Math.pow(rgb1[2]-rgb2[2],2);
      if(diff<minDiff){
        minDiff=diff;
        closestHex=validHex;
      }
    }
    return closestHex;
  };

  //將JSON格式的文字轉換為ANSI格式
  function generateAnsiText(json){
    function generateAnsiTextChild(text,style){
      if(text.translate){return text.toString();}
      let motherStyle={};
      motherStyle.color=text.color||(style?style.color:false);
      motherStyle.bold=text.bold||(style?style.bold:false);
      motherStyle.italic=text.italic||(style?style.italic:false);
      motherStyle.underlined=text.underlined||(style?style.underlined:false);
      motherStyle.strikethrough=text.strikethrough||(style?style.strikethrough:false);
      motherStyle.obfuscated=text.obfuscated||(style?style.obfuscated:false);
      let result="";
      let ae=colorChanger(motherStyle.color)||"";
      let af=styleChanger(motherStyle.bold,motherStyle.italic,motherStyle.underlined,motherStyle.strikethrough,motherStyle.obfuscated)||"";
      result+=ae+af;
      result+=sectionReader(text.text,ae+af)||"";//在此處理§
      result+=reset;
      if(text.extra && Array.isArray(text.extra)){
        text.extra.forEach(extra=>{
          result+=generateAnsiTextChild(extra,motherStyle);
        })
      }
      return result;
    }
    return generateAnsiTextChild(json)+reset;
    function sectionReader(string,style){
      if(!(string||"").length>0){return false;}
      return string.replace(/§(.)/g,(_,code)=>{
        const c=code.toLowerCase();
        if(c === 'r')return `${reset}${style}`;
        return sectToAnsi[c]||'';
      });
    }
    function colorChanger(code){
      if(!code){return false;}
      let code_color=code.toString();
      if(code_color.startsWith("#")){
        if(depth===24){
          const rgb=parseInt(code_color.slice(1),16);
          const r=(rgb>>16)&255;
          const g=(rgb>>8)&255;
          const b=rgb&255;
          return `\x1b[38;2;${r};${g};${b}m`;
        }
        if(depth===8){
          const rgb=parseInt(code_color.slice(1),16);
          const r=(rgb>>16)&255;
          const g=(rgb>>8)&255;
          const b=rgb&255;
          const rr=Math.round(r/255*5);
          const gg=Math.round(g/255*5);
          const bb=Math.round(b/255*5);
          return `\x1b[38;5;${16+36*rr+6*gg+bb}m`;
        }
        code_color=convertToValidHex(code_color);
      }
      return code_color in colorToAnsi?colorToAnsi[code_color]:false;
    }
    function styleChanger(b,i,u,s,o){
      let this_style="";
      if(b){this_style+=stylesToAnsi.bold;}
      if(i){this_style+=stylesToAnsi.italic;}
      if(u){this_style+=stylesToAnsi.underlined;}
      if(s){this_style+=stylesToAnsi.strikethrough;}
      if(o){this_style+=stylesToAnsi.obfuscated;}
      return this_style;
    }
  }

  //生成ANSI格式的文字
  let ansiText=generateAnsiText(chatMessage);
  return reset+ansiText+"\x1b[0m";
}
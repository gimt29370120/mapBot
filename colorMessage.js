//寫了很久的終端機彩色文字
const depth=process.stdout.getColorDepth();//檢查色彩深度
const reset="\x1b[0m"+(depth>=8?"\x1b[38;5;231m":"\x1b[0;97m");//\x1b[0m
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
    "k":"\x1b[6m",
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
      "k":"\x1b[6m",
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
      "k":"\x1b[6m",
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
    obfuscated:"\x1b[6m",
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

module.exports={colorMessage};
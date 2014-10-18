function breadcrumbs() {
  sURL = new String;
  bits = new Object;
  var x = 0;
  var stop = 0;
  var output = "<div class=topnav><a href=/>home</a> ª ";

  sURL = location.href;
  sURL = sURL.slice(8,sURL.length);
  chunkStart = sURL.indexOf("/");
  sURL = sURL.slice(chunkStart+1,sURL.length)

  while(!stop){
    chunkStart = sURL.indexOf("/");
    if (chunkStart != -1){
      bits[x] = sURL.slice(0,chunkStart)
      sURL = sURL.slice(chunkStart+1,sURL.length);
    } else {
      stop = 1;
    }
    x++;
  }

  for(var i in bits){
    output += "<a href=\"";
    for(y=1;y<x-i;y++){
      output += "../";
    }
    output += bits[i] + "/\">" + bits[i] + "</a> ª ";
  }
  document.write(output + document.title);
  document.write("</div>");
  }

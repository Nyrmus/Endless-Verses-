window.EVArt = window.EVArt || { ready:false, imgs:{}, _n:0, _need:0 };
EVArt.load = function(key, uri){
  EVArt._need++;
  const im = new Image();
  im.onload = function(){ EVArt.imgs[key]=im; EVArt._n++; if(EVArt._n>=EVArt._need) EVArt.ready=true; };
  im.onerror = function(){ EVArt._n++; if(EVArt._n>=EVArt._need) EVArt.ready=true; };
  im.src = uri;
};

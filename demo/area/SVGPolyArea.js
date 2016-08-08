function polyArea(poly){
    var area=0,pts=poly.points,len=pts.numberOfItems;
    for(var i=0;i<len;++i){
        var p1 = pts.getItem(i), p2=pts.getItem((i+len-1)%len);
        area += (p2.x+p1.x) * (p2.y-p1.y);
    }
    return Math.abs(area/2);
}

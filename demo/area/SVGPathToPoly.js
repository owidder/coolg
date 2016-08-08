//*** This code is copyright 2011 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
//*** Reuse or modification is free provided you abide by the terms of that license.
//*** (Including the first two lines above in your source code satisfies the conditions.)
function pathToPolygon(path,samples){
    if (!samples) samples = 0;
    var doc = path.ownerDocument;
    var poly = doc.createElementNS('http://www.w3.org/2000/svg','polygon');

    // Put all path segments in a queue
    for (var segs=[],s=path.pathSegList,i=s.numberOfItems-1;i>=0;--i) segs[i] = s.getItem(i);
    var segments = segs.concat();

    var seg,lastSeg,points=[],x,y;
    var addSegmentPoint = function(s){
        if (s.pathSegType == SVGPathSeg.PATHSEG_CLOSEPATH){

        }else{
            if (s.pathSegType%2==1 && s.pathSegType>1){
                // All odd-numbered path types are relative, except PATHSEG_CLOSEPATH (1)
                x+=s.x; y+=s.y;
            }else{
                x=s.x; y=s.y;
            }
            var lastPoint = points[points.length-1];
            if (!lastPoint || x!=lastPoint[0] || y!=lastPoint[1]) points.push([x,y]);
        }
    };
    for (var d=0,len=path.getTotalLength(),step=len/samples;d<=len;d+=step){
        var seg = segments[path.getPathSegAtLength(d)];
        var pt  = path.getPointAtLength(d);
        if (seg != lastSeg){
            lastSeg = seg;
            while (segs.length && segs[0]!=seg) addSegmentPoint( segs.shift() );
        }
        var lastPoint = points[points.length-1];
        if (!lastPoint || pt.x!=lastPoint[0] || pt.y!=lastPoint[1]) points.push([pt.x,pt.y]);
    }
    for (var i=0,len=segs.length;i<len;++i) addSegmentPoint(segs[i]);
    for (var i=0,len=points.length;i<len;++i) points[i] = points[i].join(',');
    poly.setAttribute('points',points.join(' '));
    return poly;
}

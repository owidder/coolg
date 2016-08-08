//*** This code is copyright 2012 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
//*** Reuse or modification is free provided you abide by the terms of that license.
//*** (Including the first two lines above in your source code satisfies the conditions.)
function EditablePath(path,radius){
    if (!radius) radius=1;
    var doc = path.ownerDocument;
    var dots = [];
    for (var segs=path.pathSegList,i=0,len=segs.numberOfItems;i<len;++i){
        var seg = segs.getItem(i), c = seg.pathSegTypeAsLetter;
        dots[i]={};
        if (/v/i.test(c))           dots[i].xy = makeDraggable(seg,[ 0 ,'y'],'x',radius);
        else if (/h/i.test(c))      dots[i].xy = makeDraggable(seg,['x', 0 ],'y',radius);
        else {
            if (/[MLCSQTA]/i.test(c)) dots[i].xy = makeDraggable(seg,['x','y'],null,radius);
            if (/[CQ]/i.test(c))      dots[i].x1 = makeDraggable(seg,['x1','y1'],null,radius/2);
            if (/[CS]/i.test(c))      dots[i].x2 = makeDraggable(seg,['x2','y2'],null,radius/2);
            if (/[A]/i.test(c))       console.log("ArcTo command parameters are not currently editable");
        }
    }
    positionDots();

    function makeDraggable(seg,xySet,override,radius){
        var svg = path.ownerSVGElement;
        var ox, oy, sx, sy, ocursor, pt = svg.createSVGPoint();
        var c = seg.pathSegTypeAsLetter, relative = c.toLowerCase()==c;
        var d = path.parentNode.appendChild(doc.createElementNS('http://www.w3.org/2000/svg','circle'));
        d.setAttribute('r',radius);
        d.setAttribute('class','editable-path-handle '+seg.pathSegTypeAsLetter+(relative?' relative':''));
        d.style.cursor = 'move';
        if (override) d.style.cursor = override=='y' ? 'ew-resize' : 'ns-resize';
        d.addEventListener('mousedown',startDragging);
        return d;

        function startDragging(evt){
            ox=seg[xySet[0]];
            oy=seg[xySet[1]];
            var p2 = point(evt);
            sx=p2.x; sy=p2.y;
            ocursor = svg.style.cursor;
            svg.addEventListener('mousemove',drag,false);
            svg.addEventListener('mouseup',stopDragging,false);
            svg.style.cursor = d.style.cursor;
        }
        function drag(evt){
            var p2 = point(evt);
            if (xySet[0]) seg[xySet[0]] = ox + p2.x-sx;
            if (xySet[1]) seg[xySet[1]] = oy + p2.y-sy;
            positionDots();

            var dragEvent = document.createEvent("Event");
            dragEvent.initEvent("dragged", true, true);
            path.dispatchEvent(dragEvent);
        }
        function stopDragging(evt){
            svg.removeEventListener('mousemove',drag,false);
            svg.style.cursor = ocursor;
        }
        function point(evt){
            pt.x = evt.clientX; pt.y = evt.clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }
    }

    function positionDots(){
        var x=0,y=0,x0,y0,x1,y1,x2,y2,d;
        for (var i=0;i<len;++i){
            var d=dots[i], seg=segs.getItem(i), c=seg.pathSegTypeAsLetter;
            if (/[MLHVCSQTA]/.test(c)){
                if ('x' in seg) x=seg.x;
                if ('y' in seg) y=seg.y;
                if ('x1' in seg){ x1=seg.x1; y1=seg.y1; }
                if ('x2' in seg){ x2=seg.x2; y2=seg.y2;	}
            }else{
                // Keep track of where we are, with relative commands, to place the dot
                if ('x1' in seg){ x1=x+seg.x1; y1=y+seg.y1; }
                if ('x2' in seg){ x2=x+seg.x2; y2=y+seg.y2;	}
                if ('x'  in seg) x+=seg.x;
                if ('y'  in seg) y+=seg.y;
                if (c=='z' || c=='Z'){ x=x0; y=y0; }
            }
            if (c=='M' || c=='m') x0=x, y0=y;
            if (d.xy){ d.xy.setAttribute('cx',x ); d.xy.setAttribute('cy',y ); }
            if (d.x1){ d.x1.setAttribute('cx',x1); d.x1.setAttribute('cy',y1); }
            if (d.x2){ d.x2.setAttribute('cx',x2); d.x2.setAttribute('cy',y2); }
        }
    }
}

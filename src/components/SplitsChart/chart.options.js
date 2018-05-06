export default {
  segmentShowStroke : true,
  segmentStrokeColor : '#fff',
  segmentStrokeWidth : 2,
  percentageInnerCutout : 50, 
  animationSteps : 100,
  animationEasing : 'easeOutBounce',
  animateRotate : true,
  animateScale : false,
  legendTemplate : '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"><%if(segments[i].label){%><%=segments[i].label%><%}%></span></li><%}%></ul>';
};


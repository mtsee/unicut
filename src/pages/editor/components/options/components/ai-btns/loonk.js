 
  // Classes
  const LOONK_PATH_CLASS ='loonk_scene_path';
  const LOONK_PATH_PREDICTOR_CLASS ='loonk_scene_path_predictor';
  const LOONK_PATH_HELPER_CLASS ='loonk_scene_path_helper';
  const LOONK_POINT_HELPER_CLASS ='loonk_scene_point_helper';
  const LOONK_PATH_CLASS_HOVER ='loonk_scene_path_hover';
  const END_POINT_CLASS ='loonk_controls_box_endpoint';
  const CONTROL_POINT_CLASS ='loonk_controls_box_controlpoint';
  // Colors
  const POINT_COLOR = "#DA2F74";
  const HANDLE_COLOR = "#50B5AD";
  const POINT_BORDER_COLOR = "#FFFFFF";
  const LINE_COLOR = "#E193B2";
  const PREDICTOR_COLOR = "#DA2F74A1";


  // Presets 
  const SCENE_WIDTH = 800;
  const SCENE_HEIGHT = 600;
  const MIN_HOVER_DIST = 40;


  // States
  const DRAW_STATE = {
    NONE:0,
    CREATE:1,
    INSERT:2,
    MODIFY:3,
    TRANSFORM : 4
  }

  const MOUSE_STATE = {
    DEFAULT:0,
    DRAG : 1
  }

  const PATH_STATE = {
    NONE:0,
    ACTIVE:1,
    HOVERED:2,
    SELECTED:3
  }


  /** KEYS  */
  var CONTROL_DOWN = false;
  var SHIFT_DOWN = false;
  var ALT_DOWN = false;

  var CONTROL_DOWN_KEY = "17";
  var P_DOWN_KEY = "KeyP";
 ////////////////////////


/**
 * CONTROL POINT
 * 
 */
  const pointStyle = {
    control_point_radius: 4,
    control_point_color: '#005cf9'
  }
 
  class ControlPoint {
    constructor(x, y) {
      this.x = x || 0
      this.y = y || 0
      this.selected = false // controlpoint 
      this.ep = null; // which ep this cp belongs
      this.element = null;
    }

    /*  */
    draw() {

      let svgControlPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      svgControlPoint.setAttribute('cx', this.x);
      svgControlPoint.setAttribute('cy', this.y);
      svgControlPoint.setAttribute('r', 3);
      svgControlPoint.setAttribute('fill', HANDLE_COLOR+'66');
      svgControlPoint.setAttribute('stroke', HANDLE_COLOR);
      svgControlPoint.setAttribute('stroke-width', 1);
      svgControlPoint.classList.add(CONTROL_POINT_CLASS)

      // Set both refs
      this.element = svgControlPoint;
      svgControlPoint._point = this;

      this.m_controls.appendChild(svgControlPoint)

    }
   
     
  }

/** CONTROL POINT END  */

/**
 * ENDPOINT
 */

const endpointStyle = {
    end_point_length: 5,
    mouse_end_point_length: 10,
    end_point_color: '#5d5d5d', //
    stroke_width: 2, //
    fill_color: '#ffffff', // 
    hover_fill_color: '#ffc107' //
  }
 class EndPoint {
    constructor(x, y, cp0, cp1) {
      this.x = x || 0
      this.y = y || 0
      this.selected = false // endpoint 
      this.cp0 = cp0 || new ControlPoint(x, y)
      this.cp1 = cp1 || new ControlPoint(x, y)
      this.cpBalance = true  //  
      this.element = null;

      // Set owner
      this.cp0.ep = this;
      this.cp1.ep = this;

    }
  
    draw() {
      
      let svgEndPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      svgEndPoint.setAttribute('cx', this.x);
      svgEndPoint.setAttribute('cy', this.y);
      svgEndPoint.setAttribute('r', 4);
      svgEndPoint.style.position = "relative";
      svgEndPoint.style.zIndex = 2;

      var color = POINT_COLOR+('F1'); // +opacity
      var stroke = POINT_COLOR;
      if(!this.selected) 
      {
        color = POINT_BORDER_COLOR;
        stroke = POINT_COLOR;
      }

      svgEndPoint.setAttribute('fill', color);
      svgEndPoint.setAttribute('stroke', stroke);
      svgEndPoint.setAttribute('stroke-width', 1);
      svgEndPoint.classList.add(END_POINT_CLASS)
 
      // Set both refs
      this.element = svgEndPoint;
      svgEndPoint._point = this;

      this.m_controls.appendChild(svgEndPoint)
       
    }
    
    printControlPoints(ratio) {
      ratio = ratio || 1
      this.draw();
      if(!this.selected) {
        return
      }
      if(this.cp0.x !== this.x || this.cp0.y !== this.y){
        this.cp0.draw();
        this.line(this.cp0.x, this.cp0.y, this.x,this.y)
      }
      if(this.cp1.x !== this.x || this.cp1.y !== this.y){
        this.cp1.draw();
        this.line(this.cp1.x, this.cp1.y, this.x,this.y)
      }
    }
    // draw line
    line(x1, y1, x2, y2){
     
      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', HANDLE_COLOR);
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('loonk_controls_box_endpoint_line')
      line.style.position = "relative";
      line.style.zIndex = 1;
      line.style.pointerEvents = "none";

      this.m_controls.appendChild(line)


    }
   
    distanceOfPoint(_p) {
      return Math.sqrt(
        Math.pow(this.x - _p.x, 2) + Math.pow(this.y - _p.y, 2)
      )
    }
  
    calculateControlPoint(x, y, cp) {
      if(this.cpBalance) {
        cp.opposite = (
          cp === this.cp0 ? this.cp1 : this.cp0
        )
        cp.opposite.staticDistance = cp.opposite.staticDistance
                                                ? cp.opposite.staticDistance 
                                                : this.distanceOfPoint(cp.opposite)
  
        let staticDistance = cp.opposite.staticDistance
        let dynamicDistance = this.distanceOfPoint(cp)
  
        cp.opposite.x = staticDistance / dynamicDistance * (this.x - x) + this.x
        cp.opposite.y = staticDistance / dynamicDistance * (this.y - y) + this.y
      }
      cp.x = x
      cp.y = y
    }

  }

/**
 * ENDPOINT END
 */


/**
 * PATH
 */

class Path{
  constructor (isClosed = false) {

    this.m_points = [];
    this.m_isClosed = isClosed  
    
  }

  updateSelectedEndPoint(ep) {
      ep.selected = false
  }

  deleteSelected() {
    for(let i = 0, len = this.m_points.length; i < len; i++){
      if(this.m_points[i].selected){
        this.m_points.splice(i, 1)
        len = this.m_points.length
        i--
      }
    }
  }

  addEndPoint(oed, ed) {
    for(let i = 0, len = this.m_points.length; i < len; i++){
      if(this.m_points[i] === oed){
          this.m_points.splice(i + 1, 0, ed);
      }
    }
  }

  updatePoint(_index, _newPos)
  {
    var p = this.m_points[_index];

    p.x = _newPos.x;
    p.y = _newPos.y;

    p.cp0.x = _newPos.x;
    p.cp0.y = _newPos.y;

    p.cp1.x = _newPos.x;
    p.cp1.y = _newPos.y;

  }

  insertEndPoint(ed) {
    this.m_points.push(ed)
  }
}

/** PATH END */

 
/**
 *  
 * LOONK
 * 
 */


class Loonk {
    constructor (_sceneRef = '#scene', _width = SCENE_WIDTH, _height = SCENE_HEIGHT) {
    
    this.m_sceneWidth = _width;
    this.m_sceneHeight = _height;
    
    this.m_svg = typeof _sceneRef === 'string' ? document.querySelector(_sceneRef) : _sceneRef;
    this.m_controls = this.createControlsContainer();

    this.m_pathElements = [];

    this.m_paths = [];
    this.m_path = null;


    this.m_selectedPath = null;

    // History
    this.m_history = [];
    this.m_historyIndex = -1;
    

  }
    start () {
  
      this.m_svg.setAttribute("width", this.m_sceneWidth)
      this.m_svg.setAttribute("height",  this.m_sceneHeight)
      


      this.active()

    }

    resetPath()
    {
            
      // // Presets

      this.m_drawState = DRAW_STATE.MODIFY;
      this.m_pathState = PATH_STATE.SELECTED; // select the current path for edition
      // this.m_selectedPath = null;

    }

    initPath()
    {

      // States
      this.m_drawState = DRAW_STATE.CREATE;
      this.m_mouseState = MOUSE_STATE.DEFAULT;
      this.m_pathState = PATH_STATE.ACTIVE;
  
      this.m_editCpBalance = false  
      this.m_isNewEndPoint = false   
      this.m_currentSelectedPoint = null   
      this.m_draggingControlPoint = null   
      this.m_pathStarted = false;
      this.m_currentHoverPoint = null;
      this.m_newPointInsertIndex = -1;
      this.m_newPointPrev = null;
      this.m_newPointNext = null;

      // Define controls container
      ControlPoint.prototype.m_root = this
      EndPoint.prototype.m_root = this
      ControlPoint.prototype.m_controls = this.m_controls
      EndPoint.prototype.m_controls = this.m_controls
      
      this.m_path = new Path();
      this.m_paths.push(this.m_path)
      
      /** Path */
      this.m_currentPath = this.createPathElement();
      this.m_currentPath.m_path = this.m_path; // set path ref
      /** --------------------------- */
      /** Predictor */
      this.removeHelperPath();
      this.m_predictorPath = this.createPredictorPathElement();
      /** -------------------------- */

      this.m_currentPath._hoverHelper = null;
      this.m_pathElements.push(this.m_currentPath)

      this.initSelectable(this.m_currentPath)

      this.setCursor("pen")

    }

    initSelectable(_elem)
    {
       
      this.m_svg.addEventListener('mousemove', (e)=>{
        
        var pos = this.positionToCanvas(e.clientX, e.clientY)
        if(this.m_drawState == DRAW_STATE.NONE)
        {
          this.hoverPathAtDist(_elem, pos.x, pos.y)
          return;
        }

      })

      this.m_svg.addEventListener('mousedown', (e)=>{

        var pos = this.positionToCanvas(e.clientX, e.clientY)
        // On unselected path and NONE(/MODIFY) mode : Select abd activate that path
        if(this.m_drawState == DRAW_STATE.NONE)
        {
          this.selectPathAtDist(_elem, pos.x, pos.y)
        }
      })

    }

    // select a path and (re)activate it
    selectPath(e)
    {
      var target = e.target;
      this.m_path = target.m_path; // Set new path to this element m_path property
    }
 
    // the positoin on canvas
    positionToCanvas (x, y) {
      let bbox = this.m_svg.getBoundingClientRect()
      return {
        x: x - bbox.left * (this.m_svg.clientWidth  / bbox.width),
        y: y - bbox.top  * (this.m_svg.clientHeight / bbox.height)
      }
    }
    // mouse click
    onMouseDown(e) {
  

      let pos = this.positionToCanvas(e.clientX, e.clientY)
      let selectedPath = this.getSelectedPath()
      
      this.m_mouseState = MOUSE_STATE.DRAG;

      this.m_isNewEndPoint = false
      this.m_draggingControlPoint = false
      this.m_currentSelectedPoint = this.getPoint(e);
      
      // On path and INSERT mode : Insert new point on path
      if(this.m_drawState == DRAW_STATE.INSERT)
      {
        var elem = e.target;
        if(e.detail == 1 && !this.isEndPoint(elem)) // Fixing double click double insertion bug
        {
          this.insertNewPointToBezier()
        }
      }

      // On existing point and MODIFY mode : Transform into curve/straight point
      if(this.m_drawState == DRAW_STATE.MODIFY)
      {
        if(CONTROL_DOWN && this.m_currentSelectedPoint) // Pressing Ctrl Key and selected point
        {
          var elem = e.target;
          if(this.isEndPoint(elem))
          {
            this.toggleExtremity(elem);
          }
          
        }
      }
      

      // // On unselected path and NONE(/MODIFY) mode : Select abd activate that path
      // if(this.m_drawState == DRAW_STATE.NONE)
      // {
      //   this.selectPathAtDist()
      // }

      // UI Selection -------------------------------------------
      if(!this.isControlPoint(this.m_currentSelectedPoint))
        this.updateSelectedEndPoint(this.m_currentSelectedPoint)
      //---------------------------------------------------------


      if(this.m_currentSelectedPoint )
      {
        // if the endPoint exist
        this.m_currentSelectedPoint.selected = true;
  
        if(this.m_editCpBalance && !this.m_draggingControlPoint) {
          let cep = this.m_currentSelectedPoint
          cep.cpBalance = true
          cep.cp0.x = cep.cp1.x = cep.x
          cep.cp0.y = cep.cp1.y = cep.y
          this.m_isNewEndPoint = true
        }
  
        if(this.m_drawState == DRAW_STATE.CREATE)
        { 
          if(!this.m_draggingControlPoint && this.m_currentSelectedPoint === this.m_path.m_points[0] && this.m_path.m_points.length > 2)
          {
            // First endpoint clicked ==> Close the path
            this.closePath()
            // 触发自定义闭合事件
            const event = new CustomEvent('pathClosed', { detail: { path: this.m_path } });
            this.m_svg.dispatchEvent(event);
          }
        }

        this.removeHelperPath();

      } 
      else 
      {

          if(this.m_drawState != DRAW_STATE.CREATE) return;

          this.m_currentSelectedPoint = this.createEndPoint(pos.x, pos.y) // First Point(or point n)
          this.m_isNewEndPoint = true;

          if(this.m_editCpBalance && selectedPath){
              // add endpoint to selectedendpoint after
            selectedPath.path.addEndPoint(selectedPath.ep, this.m_currentSelectedPoint)
          }else {
            this.m_path.m_points.push(this.m_currentSelectedPoint)
          }
      }


      this.render()

    }
  
    onMouseMove(e) {
      e.preventDefault()

      let pos = this.positionToCanvas(e.clientX, e.clientY)
      let csp = this.m_currentSelectedPoint // current selected point

      if(this.m_path && !this.m_path.m_isClosed && this.m_drawState != DRAW_STATE.NONE)
        this.setCursor("pen")


      if(e.buttons != 1) // Not Draging
      {
             
        // Next Endpoint prediction logic
        if(this.m_drawState == DRAW_STATE.CREATE && this.m_currentSelectedPoint)
        {
         this.setPredictor(pos)
        }
 
        if(this.m_pathState ==  PATH_STATE.SELECTED)
        {
          var target = e.target; // To filter endpoints/controlpoints
          this.hoverAtDist(target, pos.x, pos.y)
        }


      }
      else
      {

        // if(this.m_drawState == DRAW_STATE.NONE)
        // {
        //   this.hoverPathAtDist(this.m_currentPath, pos.x, pos.y)
        //   return;
        // }

        if(this.m_mouseState != MOUSE_STATE.DRAG) return;

        if(this.m_isNewEndPoint  && this.m_drawState != DRAW_STATE.INSERT)
        {
            csp.cp1.x = pos.x
            csp.cp1.y = pos.y
    
            csp.cp0.x = csp.x * 2 - pos.x
            csp.cp0.y = csp.y * 2 - pos.y
        } 
        else if (this.m_draggingControlPoint)
        {
            // Dragging controlPoint

            if(this.m_editCpBalance){
                csp.cpBalance = false
            }
            this.m_draggingControlPoint.x = pos.x
            this.m_draggingControlPoint.y = pos.y

            csp.ep.calculateControlPoint(pos.x, pos.y, this.m_draggingControlPoint)

        } 
        else if(this.m_currentSelectedPoint && this.m_drawState != DRAW_STATE.INSERT)
        {

            // Dragging endpoint

            this.setCursor("arrow")

            let offset = {
              x: pos.x - csp.x,
              y: pos.y - csp.y
            }
            csp.x = pos.x
            csp.y = pos.y
    
            csp.cp1.x += offset.x
            csp.cp1.y += offset.y
            csp.cp0.x += offset.x
            csp.cp0.y += offset.y

        }
        // this.setPredictor(pos)
  
        this.render()

      }

      
    }
    onMouseUp(e) { 

      this.m_mouseState = MOUSE_STATE.DEFAULT;

      if(this.m_draggingControlPoint){
        if(this.m_draggingControlPoint.opposite) {
          delete this.m_draggingControlPoint.opposite.staticDistance
        }
        delete this.m_draggingControlPoint.opposite
        this.m_draggingControlPoint = false
      }
    }
  
    // key down: provide delete endPoint
    onKeyDown(e) {
      switch(e.key) {
        case "Delete": 
          e.preventDefault()
          this.deleteEndPoint()
          this.render()
          break;
        case "Enter" :
          if(this.m_path.m_points.length > 1)
          {
            this.render()
          }
          
          this.resetPath();
              
          this.m_drawState = DRAW_STATE.NONE;
          this.m_mouseState = MOUSE_STATE.DEFAULT;
          this.m_pathState = PATH_STATE.NONE;

          this.removePredictorPath();
          this.removeControls();
              
          // Get Internal points...
          this.updatePathInternalPoints(); 

          this.setCursor("arrow")
        
          break;
         
      }

      // Ctrl down
      if(e.which == CONTROL_DOWN_KEY) 
        CONTROL_DOWN = true;

      // Re-Start new Pen tool
      if(e.code == P_DOWN_KEY)
      {
        if(this.m_drawState == DRAW_STATE.NONE)
        {
          this.initPath();
        }
      }



    }

    onKeyUp(e) {

      if(e.which == "17")
        CONTROL_DOWN = false; // Ctrl up

    }
    // active the canvas's eventListner
    active() {
      let that = this
      let listeners = {
        mousedown(e) { that.onMouseDown(e) },
        mousemove(e) { that.onMouseMove(e) },
        mouseup(e) { that.onMouseUp(e) },
        keydown(e) { that.onKeyDown(e) },
        keyup(e) { that.onKeyUp(e) }
    };
      this.m_svg.addEventListener('mousedown', listeners.mousedown, false)
      this.m_svg.addEventListener('mousemove', listeners.mousemove, false)
      this.m_svg.addEventListener('mouseup', listeners.mouseup, false)
      document.addEventListener('keydown', listeners.keydown, false)
      document.addEventListener('keyup', listeners.keyup, false)
    }
  
    distanceOfPoint(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    
    // Insert a new endpoint at the hovered position in current path
    insertNewPointToBezier()
    {

      if(this.m_newPointInsertIndex == -1) // Not in path
        return;

      var start = this.m_newPointPrev;
      var end = this.m_newPointNext;

      var relativeIndex = this.getPointRelativeIndex(this.m_currentHoverPoint, start, end);

      if(this.m_newPointInsertIndex == 0)
        relativeIndex = this.getPointReverseRelativeIndex(this.m_currentHoverPoint, start, end);

      var result = this.splitBezier(start, start.cp1, end.cp0, end, relativeIndex);

      // The following logic relies on "bezierCurveTo" Method logic 
      // in order to set for each point it's control points (insertedPoint and nextPoint)
      var newPoint = result.newPoint; // Presets of the New point to insert
      var endPoint = result.endPoint; // Presets of the Point after the new point
      var startPoint = result.startPoint; // Presets of the Point before the new point

      // Define new point's controls
      var tPoint = this.createEndPoint(this.m_currentHoverPoint.x, this.m_currentHoverPoint.y)
      /** Control points */
      tPoint.cp0.x = newPoint.cp0.x;  
      tPoint.cp0.y = newPoint.cp0.y;
      tPoint.cp1.x = newPoint.cp1.x;
      tPoint.cp1.y = newPoint.cp1.y;

      // Insert the new point
      this.m_path.m_points.splice(this.m_newPointInsertIndex, 0, tPoint);
    
      var prevIndex = this.m_newPointInsertIndex-1;
      var nextIndex = this.m_newPointInsertIndex+1;

      if(this.m_newPointInsertIndex == 0) 
      {
        prevIndex = 0;
        nextIndex = this.m_path.m_points.length - 1; 

        this.m_path.m_points[prevIndex].cp1.x = newPoint.cp1.x;
        this.m_path.m_points[prevIndex].cp1.y = newPoint.cp1.y;
        
        this.m_path.m_points[nextIndex].cp1.x = startPoint.cp.x;
        this.m_path.m_points[nextIndex].cp1.y = startPoint.cp.y;
      }
      else
      {
        this.m_path.m_points[prevIndex].cp1.x = startPoint.cp.x;
        this.m_path.m_points[prevIndex].cp1.y = startPoint.cp.y;
        /* Update next point's controls */
        this.m_path.m_points[nextIndex].cp0.x = endPoint.cp.x;
        this.m_path.m_points[nextIndex].cp0.y = endPoint.cp.y;
      }
     
      // Render
      this.render()

    }
    
    // Helps to hover the path at a defined distance in order to make thin stroke easier to be hovered
    hoverAtDist(_target, x, y) {
      let minDist = MIN_HOVER_DIST;
      const len = this.m_currentPath.m_shapePoints.length;

      let closestPointIndex = -1;
      var p = null;
      for (let i = 0; i < len; i++) {

        const point = this.m_currentPath.m_shapePoints[i];

        const dist = (x - point.x) ** 2 + (y - point.y) ** 2;

        if (dist < minDist) {
          minDist = dist;
          closestPointIndex = i;
          p = point
        }
      }
    
      if (closestPointIndex !== -1) 
      { 
        this.setCursor("insert")

        this.createHelperPoint(p.x, p.y);
        this.getInsertionIndex(p);

        this.m_drawState = DRAW_STATE.INSERT;

        // Check if the cursor is on a endpoint/controlpoint
        if(_target.classList.contains(END_POINT_CLASS) || _target.classList.contains(CONTROL_POINT_CLASS))
        {
          this.m_drawState = DRAW_STATE.MODIFY;
          this.removeHelperPoint();
        }

      } 
      else 
      {
        this.setCursor("arrow")

        this.removeHelperPoint();
        this.removeHelperPath();

        this.m_drawState = DRAW_STATE.MODIFY;

      }
    }


    hoverPathAtDist(_target, x, y) {
      let minDist = MIN_HOVER_DIST;
      const len = _target.m_shapePoints.length;

      let closestPointIndex = -1;
      for (let i = 0; i < len; i++) 
      {
        const point = _target.m_shapePoints[i];

        const dist = (x - point.x) ** 2 + (y - point.y) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closestPointIndex = i;
        }

      }
    
      if (closestPointIndex !== -1) 
      { 
        _target.classList.add(LOONK_PATH_CLASS_HOVER)
        
      } 
      else 
      {
        _target.classList.remove(LOONK_PATH_CLASS_HOVER)
      }

    }

    selectPathAtDist(_target, x, y)
    {
      let minDist = MIN_HOVER_DIST;
      const len = _target.m_shapePoints.length;

      let closestPointIndex = -1;
      for (let i = 0; i < len; i++) 
      {
        const point = _target.m_shapePoints[i];

        const dist = (x - point.x) ** 2 + (y - point.y) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closestPointIndex = i;
        }

      }
    
      if (closestPointIndex !== -1) 
      { 
        this.activatePath(_target)
      }
    }

    activatePath(_elem)
    {
      this.m_path = _elem.m_path;
      this.m_currentPath = _elem;
      _elem.classList.remove(LOONK_PATH_CLASS_HOVER);

      this.m_drawState = DRAW_STATE.MODIFY;
      this.m_mouseState = MOUSE_STATE.DEFAULT;
      this.m_pathState = PATH_STATE.SELECTED;

      this.render();

    }
    // Replace (.getTotalLength + Loop through .getPointAtLength) : which is too memory consuming and lag causing
    getPointsAlongCurve(d) {

      let commands = d.match(/[A-Za-z][^A-Za-z]*/g);
      let points = [];
      const NUMBER_OF_STEPS = 150; // to be more accurate 
      let currentX = 0;
      let currentY = 0;
    
      let step = 1 / NUMBER_OF_STEPS;

      for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        let type = command[0];
        let values = command.substring(1).trim().split(/[\s,]+/);
    
        switch (type) {
          case "M":
            currentX = parseFloat(values[0]);
            currentY = parseFloat(values[1]);
            break;
          case "C":
            let x1 = parseFloat(values[0]);
            let y1 = parseFloat(values[1]);
            let x2 = parseFloat(values[2]);
            let y2 = parseFloat(values[3]);
            let x = parseFloat(values[4]);
            let y = parseFloat(values[5]);
    
            // Approximate the curve using line segments
            let t = 0;
            while (t < 1) {
              let xT =
                currentX * (1 - t) * (1 - t) * (1 - t) +
                3 * x1 * t * (1 - t) * (1 - t) +
                3 * x2 * t * t * (1 - t) +
                x * t * t * t;
              let yT =
                currentY * (1 - t) * (1 - t) * (1 - t) +
                3 * y1 * t * (1 - t) * (1 - t) +
                3 * y2 * t * t * (1 - t) +
                y * t * t * t;
              points.push({ x: xT, y: yT });
              t += step;
            }
    
            currentX = x;
            currentY = y;
            break;
        }
      }
    
      points.push(this.m_path.m_points[this.m_path.m_points.length-1]); // Add the last point

      return points;

    }  
    

    getInsertionIndex(pos, _highlightPortion = false)
    {
      // Get the path portion and the insertion index
      var insertIndex = -1;
      var contactPoint = this.createSVGPoint(pos.x, pos.y)
      for (let i = 0; i < this.m_path.m_points.length; i++)   
      {
        // Get current point and next
        const p = this.m_path.m_points[i];
        var nextI = (i+1) > (this.m_path.m_points.length-1) ? 0 : (i+1);
        const nextP = this.m_path.m_points[nextI];

        // Create the portion 
        var portion = this.createHelperPath(p, nextP)

        this.m_svg.appendChild(portion)
        // and check if current mouse pos is in this portion
        if(portion.isPointInStroke(contactPoint))
        {
          insertIndex = nextI;
          portion.setAttribute("stroke", POINT_COLOR)
          portion.setAttribute("stroke-width", 2.5)

          // Set refs for later
          this.m_newPointPrev = p;
          this.m_newPointNext = nextP;

          break;
        }
        else
        {
          this.m_svg.removeChild(portion)
        }


      }
      // console.log(insertIndex)
      this.m_newPointInsertIndex = insertIndex;
      return insertIndex;

    }

    // Get the relative index of a given point along a curve defined by two points
    getPointRelativeIndex(h, p1, p2)
    {
      //Get p1 and p2 indexes
      var p1Index = this.m_currentPath.m_shapePoints.findIndex(p=>p.x == p1.x && p.y == p1.y);
      var p2Index = this.m_currentPath.m_shapePoints.findIndex(p=>p.x == p2.x && p.y == p2.y);
      var hIndex = this.m_currentPath.m_shapePoints.findIndex(p=>p.x == h.x && p.y == h.y);
   
      var relativeIndex = (hIndex - p1Index) / (p2Index - p1Index);

      return relativeIndex;

    } 

    // Get the relative index of a given point along a curve defined by two points
    getPointReverseRelativeIndex(h, p1, p2)
    {
      var fulldist = this.distanceOfPoint(p1.x, p1.y, p2.x, p2.y);
      var partialdist = this.distanceOfPoint(p1.x, p1.y, h.x, h.y);

      var relativeIndex = partialdist / fulldist;

      return relativeIndex;

    } 

    // Function to split a Bézier curve into two smaller curves
    splitBezier(_startPoint, cp1, cp2, _endPoint, t=0.5) {

      let startPoint = {x:_startPoint.x, y:_startPoint.y};
      let controlPoint1 = {x:cp1.x, y:cp1.y};
      let controlPoint2 = {x:cp2.x, y:cp2.y};
      let endPoint = {x:_endPoint.x, y:_endPoint.y};
      
      let B0 = [(1 - t) * startPoint.x + t * controlPoint1.x, (1 - t) * startPoint.y + t * controlPoint1.y];
      let B1 = [(1 - t) * controlPoint1.x + t * controlPoint2.x, (1 - t) * controlPoint1.y + t * controlPoint2.y];
      let B2 = [(1 - t) * controlPoint2.x + t * endPoint.x, (1 - t) * controlPoint2.y + t * endPoint.y];
      let B01 = [(1 - t) * B0[0] + t * B1[0], (1 - t) * B0[1] + t * B1[1]];
      let B12 = [(1 - t) * B1[0] + t * B2[0], (1 - t) * B1[1] + t * B2[1]];
      let B012 = [(1 - t) * B01[0] + t * B12[0], (1 - t) * B01[1] + t * B12[1]];

      var result = 
      {
        newPoint    : {  ep : {x:B012[0],  y:B012[1]}, cp0:{x:B01[0],  y:B01[1]},   cp1:{x:B12[0],  y:B12[1]}},
        startPoint  : {  cp : {x:B0[0], y:B0[1]}},
        endPoint    : {  cp : {x:B2[0], y:B2[1]}}
      }

      return result;
    }

    getPointIndex(_point) // pos
    {
      return this.m_path.m_points.findIndex(p=>(p.x == _point.x && p.y == _point.y));
    }

    toggleExtremity(_elem)
    {
      var _pointIndex = this.m_path.m_points.findIndex(p=>p.element == _elem)
      var point = this.m_path.m_points[_pointIndex];

      if(this.isCorner(point))
      {
        this.cornerToCurve(_pointIndex)
      }
      else
      {
        this.curveToCorner(_pointIndex);
      }

    }

    cornerToCurve(_pointIndex)
    {
      var point = this.m_path.m_points[_pointIndex]
      // Manage prev and next later 
      var prevIndex = (_pointIndex-1); 
      var nextIndex = (_pointIndex+1); 

      var extremityDir = 0 ; // Used to handle extremity points

      if(prevIndex < 0) 
      {
        prevIndex = _pointIndex;
        extremityDir = 1;
      }
      if(nextIndex > (this.m_path.m_points.length-1))
      {
        nextIndex = (this.m_path.m_points.length-1);
        extremityDir = -1;
      }

      var cps = {}; // final control points
      // ---
      var prevPoint = {...this.m_path.m_points[prevIndex]};
      var nextPoint = {...this.m_path.m_points[nextIndex]};
 
      if(extremityDir == 0) // Normal point with inf and sup extremity
      {

        // Get line equation coef-dir (m) y=mx+p of the side to side points ()
        var m = (nextPoint.y - prevPoint.y) / (nextPoint.x - prevPoint.x);
        // --------------------------------------------------------
        // As they are parallel so they share the same (m), let's now find the (p) by using our targeted point values
        var m_ = m;
        var p = point.y - (m_ * point.x);
        // --------------------------------------------------------
        // Get the line eq of the perpendicular passing by prevPoint : As they are perp mprev = -1/m
        var mprev = -1/m_;
        // Now Let's find it's b using prevPoint values
        var pprev = prevPoint.y - (mprev * prevPoint.x);
        // --------------------------------------------------------
        // Get the line eq of the perpendicular passing by nextPoint : As they are perp mnext = -1/m
        var mnext = -1/m_;
        // Now Let's find it's b using nextPoint values
        var pnext = nextPoint.y - (mnext * nextPoint.x);
        // ----------------------------------------------------------
        // Now Get the intersections Left and Right
        // 1 :
        var prevInterx = (p - pprev) / (m_ - mprev)
        var prevIntery = mprev * prevInterx - pprev;
        // 2 :
        var nextInterx = (p - pnext) / (m_ - mnext)
        var nextIntery = mnext * nextInterx - pnext;

        // ----------------------------------------------------------
        cps = {
                cp0 : { x : -(prevInterx), y : -(prevIntery)},
                cp1 : { x : -(nextInterx), y : -(nextIntery)}
              }

        // Get shortest distance from central point with processed control points and get the needed control point
        var d0 = this.distanceOfPoint(point.x, point.y, cps.cp0.x, cps.cp0.y);
        var d1 = this.distanceOfPoint(point.x, point.y, cps.cp1.x, cps.cp1.y);
        var cp = d0 < d1 ? {...cps.cp0} : {...cps.cp1};
        // Get the image of the nearest control point then
        var cpImage = { x : (2*point.x - cp.x), y : (2*point.y - cp.y)};

        if(d0 < d1) //keep cp0, modify cp1
          cps.cp1 = cpImage;
        else        //keep cp1, modify cp0
          cps.cp0 = cpImage;

      }
      else // We just get the middle of the path as its control point
      {
        var extremityPoint = this.m_path.m_points[_pointIndex+extremityDir];
        // Get middle point
        var midPoint = {x : (point.x+extremityPoint.x)/2, y: (point.y+extremityPoint.y)/2 }

        cps = {
          cp0 : { x : point.cp0.x, y :  point.cp0.y },
          cp1 : { x : point.cp1.x, y :  point.cp1.y }
        }

        if(extremityDir == 1) cps.cp1 = midPoint;
        else                  cps.cp0 = midPoint;

      }
      

      /* Update point's controls */
      this.m_path.m_points[_pointIndex].cp0.x = cps.cp0.x;
      this.m_path.m_points[_pointIndex].cp0.y = cps.cp0.y;

      this.m_path.m_points[_pointIndex].cp1.x = cps.cp1.x;
      this.m_path.m_points[_pointIndex].cp1.y = cps.cp1.y;
    

    }
 
    curveToCorner(_pointIndex)
    {

      var point = this.m_path.m_points[_pointIndex]
      // Manage prev and next later 
      var prevIndex = (_pointIndex-1); 
      var nextIndex = (_pointIndex+1); 

      var extremityDir = 0 ; // Used to handle extremity points

      if(prevIndex < 0) 
      {
        prevIndex = _pointIndex;
        extremityDir = 1;
      }
      if(nextIndex > (this.m_path.m_points.length-1))
      {
        nextIndex = (this.m_path.m_points.length-1);
        extremityDir = -1;
      }

      var cps = {}; // final control points
      // ---
      // var prevPoint = {...this.m_path.m_points[prevIndex]};
      // var nextPoint = {...this.m_path.m_points[nextIndex]};


      /* Update point's controls */
      this.m_path.m_points[_pointIndex].cp0.x = point.x;
      this.m_path.m_points[_pointIndex].cp0.y = point.y;

      this.m_path.m_points[_pointIndex].cp1.x = point.x;
      this.m_path.m_points[_pointIndex].cp1.y = point.y;

 
    }

    isCorner(_point)
    {
      if(((_point.x == _point.cp0.x) && (_point.x == _point.cp1.x)) && ((_point.y == _point.cp0.y) && (_point.y == _point.cp1.y)))
        return true;

      return false;
    }

    createSVGPoint(_x, _y)
    {
      var p = this.m_svg.createSVGPoint()
      p.x = _x;
      p.y = _y;
      return p
    }
    createHelperPath(p1, p2)
    {

      if(this.m_svg.querySelector("."+LOONK_PATH_HELPER_CLASS)) // Preventing multiple helper path
      {
        this.m_svg.removeChild(this.m_svg.querySelector("."+LOONK_PATH_HELPER_CLASS))
      }

      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add(LOONK_PATH_HELPER_CLASS);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "transparent");
      path.setAttribute("stroke-width", 1.2);
      path.style.pointerEvents = "none";

      var curve = this.createBezier(p1, p2)
      var d = "M"+p1.x+ ","+p1.y + curve;
      path.setAttribute("d", d);

      return path;

    }

    updatePredictorPath(p1, p2)
    {
      var curve = this.createBezier(p1, p2)
      var d = "M"+p1.x+ ","+p1.y + curve;

      this.m_predictorPath.setAttribute("d", d);
      this.m_predictorPath.m_pos = p2;
    }

    setPredictor(_pos)
    {
      var prev_ep = this.m_path.m_points.at(-1);
      var next_ep = this.createEndPoint(_pos.x, _pos.y) // Next Point(or point n+1)
      this.updatePredictorPath(prev_ep, next_ep);
    }

    createHelperPoint(_x, _y)
    {

      // Create future endpoint to be added
      this.m_currentHoverPoint = this.createEndPoint(_x, _y) // NOTE : After the if bloc => was causing bug on new point position

      if(this.m_svg.querySelector("."+LOONK_POINT_HELPER_CLASS))
      {
        var p = this.m_svg.querySelector("."+LOONK_POINT_HELPER_CLASS);
        p.setAttribute('cx', _x);
        p.setAttribute('cy', _y);
        p.style.pointerEvents = "none";
        return;
      }

      let point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      point.setAttribute('cx', _x);
      point.setAttribute('cy', _y);
      point.setAttribute('r', 4);
      point.setAttribute('fill', POINT_COLOR);
      point.setAttribute('stroke', POINT_COLOR);
      point.setAttribute('stroke-width', 1);
      point.style.pointerEvents = "none";
      point.classList.add(LOONK_POINT_HELPER_CLASS)

      this.m_controls.appendChild(point);

    }

    removeHelperPoint()
    {
      // Remove pointHelper
      var pointHelper = this.m_svg.querySelector("."+LOONK_POINT_HELPER_CLASS);
      if(pointHelper)
        this.m_controls.removeChild(pointHelper);

    }

    removeHelperPath()
    {
      // Remove pathHelpers : Higlighters
      var pathHelpers = this.m_svg.querySelectorAll("."+ LOONK_PATH_HELPER_CLASS)
      pathHelpers.forEach(el => {
        this.m_svg.removeChild(el);
      });
    }

    
    removeControls()
    {
      // Remove all controls
        
      while(this.m_controls.hasChildNodes())
      {
        this.m_controls.removeChild(this.m_controls.lastChild);
      }

    }
  
    closePath() {

      // Close current Path
      this.m_path.m_isClosed = true // Close previous path
      this.resetPath();

      this.setCursor("arrow")

    }
 
    setCursor(_cursor)
    {
      var toremove = [];
      switch (_cursor) {
        case "arrow":
          toremove = ["cursor_pen", "cursor_insert"]
          break;
        case "pen":
          toremove = ["cursor_arrow", "cursor_insert"]
          break;
        case "insert":
          toremove = ["cursor_arrow", "cursor_pen"]
          break;
      }

      this.m_svg.classList.remove(...toremove)
      this.m_svg.classList.add("cursor_"+_cursor)

    }

    createPathElement()
    {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute("id", LOONK_PATH_CLASS+"_"+this.m_pathElements.length);
      path.classList.add(LOONK_PATH_CLASS);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", 1.0);

      
      this.m_svg.prepend(path)
      return path;
    }

    createPredictorPathElement()
    {
      var basePath = this.createPathElement();
      basePath.removeAttribute("id");
      basePath.classList.replace(LOONK_PATH_CLASS, LOONK_PATH_PREDICTOR_CLASS);
      basePath.setAttribute("stroke-width", 1)
      basePath.setAttribute("stroke", PREDICTOR_COLOR)
      basePath.setAttribute("stroke-dasharray", "4 4")

      return basePath;
    }

    createControlsContainer()
    {
      let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add("loonk_controls_box");
      this.m_svg.appendChild(group)
      this.m_controls = group;
      return group;
    }
  
    getSelectedPath() {
        
      if (!this.m_path || !this.m_path.m_points) return null;
      for(let i = 0, len = this.m_path.m_points.length; i < len; i++){
          if(this.m_path.m_points[i].selected){
             var selectedPath = {
              path: this.m_path,
              ep: this.m_path.m_points[i]
            }
            return selectedPath;
          }
        }
      return null
    }
  
    isElementPath(_elem)
    {
      if(_elem instanceof SVGElement)
      {
        return (_elem.classList.contains(LOONK_PATH_CLASS))
      }
      return false;
    }

    isEndPoint(_point)
    {
      if(!(_point instanceof SVGElement))
      {
        return (_point.element.classList.contains(END_POINT_CLASS))
      }
      else if(_point instanceof SVGCircleElement)
      {
        return _point.classList.contains(END_POINT_CLASS)
      }
      return false;
    }

    isControlPoint(_point)
    {
      if(_point)
      {
        return (_point.element.classList.contains(CONTROL_POINT_CLASS))
      }
      return false;
    }

    updateSelectedEndPoint() {
      this.m_path.m_points.forEach((ep) => {
        this.m_path.updateSelectedEndPoint(ep)
      })
    }
  
    createEndPoint(x, y) {
      let ep = new EndPoint(x, y)
      ep.selected = true
      return ep
    }
  
    // delete point
    deleteEndPoint() {

      this.m_path.deleteSelected()
       
    }
  

    getPoint(e)
    {
      var _el = e.target;
      if(_el.classList.contains(END_POINT_CLASS))
      {
        return _el._point;
      }
      else if(_el.classList.contains(CONTROL_POINT_CLASS))
      {
        var p = _el._point;
        this.m_draggingControlPoint = p;
        return p;
      }
      return null;
    }

    // render the spline
    render() {
      let ep, prev_ep
  
      this.m_currentPath.setAttribute("d", "")
      this.m_pathStarted = false;
      this.m_svg.querySelector('.loonk_controls_box').innerHTML = null;

      // Update selection
      this.updateSelection();

      let len = this.m_path.m_points.length
      for(let i = 0; i < len; i++) {
        ep = this.m_path.m_points[i]
        ep.printControlPoints()
        if(!this.m_pathStarted)
        {
            this.m_currentPath.setAttribute("d", "M"+ep.x + "," + ep.y)
            this.m_pathStarted = true
        }
        if(i > 0) {
          // draw line
          prev_ep = this.m_path.m_points[i - 1];
          this.bezierCurveTo(prev_ep, ep)
        }
      }
      if(this.m_path && this.m_path.m_isClosed){
          prev_ep = this.m_path.m_points[len - 1]
          ep = this.m_path.m_points[0]
          this.bezierCurveTo(prev_ep, ep)

          // Init new path....
          // this.initPath()

          // console.log(this.m_path.m_points)
      
      }

    }
  
    bezierCurveTo(prev_ep, ep) {
    
        var d = this.m_currentPath.getAttribute('d');
        d += this.createBezier(prev_ep, ep)
        this.m_currentPath.setAttribute("d", d)

        if(this.m_pathState == PATH_STATE.SELECTED)
        {
          // Remove predictor path from DOM
          this.removePredictorPath();
          
        // Get Internal points...
          this.updatePathInternalPoints();

        }
        
        
    }

    // onRemove endpoint select previous one
    updateSelection() 
    {
       // SELECTION CONTROLLER
       if(this.m_drawState == DRAW_STATE.CREATE)
       {
         var selected = this.m_path.m_points.findIndex(p=>p.selected);
         if(selected == -1) // No selected item : select last one then
         {
           this.m_path.m_points[this.m_path.m_points.length-1].selected = true;

           // Predictor
           this.setPredictor(this.m_predictorPath.m_pos);
         }  
       }
    }

    createBezier(prev_ep, ep)
    {
      return 'C'+ prev_ep.cp1.x + "," + prev_ep.cp1.y + " " +
      ep.cp0.x + "," + ep.cp0.y + " " +
      ep.x + "," + ep.y;
      
    }

    updatePathInternalPoints()
    {
      // Store path internal points once for optimization
      setTimeout(() => {
          var shapePoints = this.getPointsAlongCurve(this.m_currentPath.getAttribute("d"));
          this.m_currentPath.m_shapePoints = shapePoints;
      }, 100); // In order to close without delay the path

    }

    removePredictorPath()
    {
      if(this.m_svg.querySelector("."+LOONK_PATH_PREDICTOR_CLASS))
      {
        var predictor = this.m_svg.querySelector("."+LOONK_PATH_PREDICTOR_CLASS);
        this.m_svg.removeChild(predictor);
      }
    }

  }
  
/** PEN END */


/**
 * 
 * MAIN
 * 
 */

export default Loonk;

var svg = document.getElementById("main_canvas")
var svg_points = document.getElementById('svg_points')
var svg_others = document.getElementById('svg_others')
var svg_tracks = document.getElementById('svg_tracks')
var svg_curves = document.getElementById('svg_curves')
var svg_texts = document.getElementById('svg_texts')
var obj_list = document.getElementById('obj_list')
var property_window = document.getElementById('property')
var bias_x = 0, bias_y = 0
var point_r = 3
var axis_on = false

let selected_points = []
let selected_lines = []
let selected_circles = []
let selected_curves = []
let selected_variables = []

svg.oncontextmenu = function (){return false}
svg.onmousewheel = function (event){
    event.preventDefault();
    let newScale = svg.currentScale
    if(event.deltaY > 0){
        newScale -= 0.05
    }else{
        newScale += 0.05
    }
    if(newScale <= 0.3) {
        return;
    }
    svg.currentScale = newScale

}

class Graph{
    chosen = false
    div_obj
    tracks
    tracks_checkbox
}
class Animation{
    div_obj

    variable_name
    range
    step
    interval
    current_value
    time_fun = 0
    play_status = false

    play_button
    pause_button
    stop_button
    constructor(variable_name, range, step, interval) {
        this.variable_name = variable_name
        this.range = range
        this.step = step
        this.interval = interval
        this.current_value = range.low

        let div_obj = document.createElement("div")
        let play_button = document.createElement("button")
        play_button.appendChild(document.createTextNode('Play'))
        play_button.classList.value='animation-button'
        let pause_button = document.createElement("button")
        pause_button.appendChild(document.createTextNode('Pause'))
        pause_button.classList.value='animation-button'
        let stop_button = document.createElement("button")
        stop_button.appendChild(document.createTextNode('Stop'))
        stop_button.classList.value='animation-button'
        let Ct = document.createTextNode('Animation \''+variable_name+'\'')
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)
        div_obj.appendChild(Ct)
        //div_obj.appendChild(play_button)
        //div_obj.appendChild(pause_button)
        //div_obj.appendChild(stop_button)
        this.div_obj = div_obj
        let p = this

        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        play_button.onclick = function(){
            if(p.play_status){return}
            p.play_status = true
            let variable_obj
            for(let i in graph.Variables){
                if(graph.Variables[i].variable_name === p.variable_name){
                    variable_obj = graph.Variables[i]
                }
            }
            let variable_interval = (p.range.high - p.range.low) / p.step
            console.log(p.play_status, variable_interval,  p.current_value)


            p.time_fun = setInterval(function (){
                if(p.play_status){
                    console.log(p.current_value)
                    if (p.current_value >= p.range.high){
                        p.current_value = p.range.high
                        p.play_status = false
                    }
                    variable_obj.current_value = p.current_value
                    p.current_value = p.current_value + variable_interval
                    $('#cv_input_' + p.variable_name).val(variable_obj.current_value)
                    variable_obj.ReCalculate_variable_changed()
                }else{
                    clearInterval(p.time_fun);
                    p.current_value = range.low
                }
            },p.interval)

        }
        pause_button.onclick = function (){
            clearInterval(p.time_fun);
            p.play_status = false

        }
        stop_button.onclick = function (){
            clearInterval(p.time_fun)
            p.play_status = false
            p.current_value = range.low
        }
        this.play_button = play_button
        this.pause_button = pause_button
        this.stop_button = stop_button
    }
    show_property(){
        let play_button = this.play_button
        let pause_button = this.pause_button
        let stop_button = this.stop_button

        let start_div = document.createElement('div')
        start_div.appendChild(document.createTextNode('Start:'))
        let start_input = document.createElement('input')
        start_input.value = this.range.low
        start_div.appendChild(start_input)

        let end_div = document.createElement('div')
        end_div.appendChild(document.createTextNode('End:'))
        let end_input = document.createElement('input')
        end_input.value = this.range.high
        end_div.appendChild(end_input)

        let step_div = document.createElement('div')
        step_div.appendChild(document.createTextNode('Steps:'))
        let step_input = document.createElement('input')
        step_input.value = this.step
        step_div.appendChild(step_input)

        let interval_div = document.createElement('div')
        interval_div.appendChild(document.createTextNode('Time Interval:'))
        let interval_input = document.createElement('input')
        interval_input.value = this.interval
        interval_div.appendChild(interval_input)

        let cv_div = document.createElement('div')
        cv_div.appendChild(document.createTextNode('Current Value:'))
        let cv_input = document.createElement('input')
        cv_input.value = this.current_value
        cv_div.appendChild(cv_input)
        cv_input.id = 'cv_input_' + this.variable_name
        property_window.appendChild(play_button)
        property_window.appendChild(pause_button)
        property_window.appendChild(stop_button)
        property_window.appendChild(start_div)
        property_window.appendChild(end_div)
        property_window.appendChild(step_div)
        property_window.appendChild(interval_div)
        property_window.appendChild(cv_div)
    }
    chosen_switch(){
        methods.clear_property_window()
        if(this.chosen){
            this.chosen = false
            this.div_obj.style.backgroundColor = 'white'
        }
        else{
            this.chosen = true

            this.div_obj.style.backgroundColor = 'red'
            this.show_property()
        }
    }
}
class Variable extends Graph{
    variable_name
    range
    increment
    current_value
    assist_div
    assist_div_id
    associate_functions = []
    constructor(variable_name, range, increment, current_value) {
        super()
        this.variable_name = variable_name
        this.range = range
        this.increment = increment
        this.current_value = current_value
        this.assist_div_id = variable_name
        let div_obj = document.createElement("div")
        let Ct = document.createTextNode('Variable: '+variable_name)
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)
        div_obj.appendChild(Ct)
        this.div_obj = div_obj
        let p = this
        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        this.div_obj.ondblclick = function (event){
            p.show_variable_window()
        }
    }
    chosen_switch(){
        methods.clear_property_window()
        console.log($('#'+this.assist_div_id).position().top-$('#'+this.assist_div_id).parent().position().top,$('#'+this.assist_div_id).position().left-$('#'+this.assist_div_id).parent().position().left)
        if(this.chosen){
            this.chosen = false
            for (let k in selected_variables){
                if(selected_variables[k].variable === this){
                    selected_variables.splice(k,1)
                }
            }
            this.assist_div.style.borderColor = 'black'
            this.div_obj.style.backgroundColor = 'white'

        }
        else{
            this.chosen = true
            selected_variables.push({
                variable:this,
                x:$('#'+this.assist_div_id).position().left-$('#'+this.assist_div_id).parent().position().left,
                y:$('#'+this.assist_div_id).position().top-$('#'+this.assist_div_id).parent().position().top
            })
            this.assist_div.style.borderColor = 'red'
            this.div_obj.style.backgroundColor = 'red'

        }
    }

    ReCalculate_chosen(x,y){
        this.assist_div.style.left = x + 'px'
        this.assist_div.style.top = y + 'px'
    }
    ReCalculate_variable_changed(){
        $( "#variable_slider_" + this.variable_name).slider({value: this.current_value})
        $('#variable_input_' + this.variable_name).val(this.current_value)
        for(let i in this.associate_functions){
            this.associate_functions[i].ReCalculate()
        }
    }
    show_variable_window(){

        let window = document.createElement('div')
        let win = document.createElement('div')
        let title = document.createElement('div')
        let inputs_form = document.createElement('div')
        let title_div = document.createElement('div')
        let e_title_variable = document.createElement('div')
        let e_title_minimum = document.createElement('div')
        let e_title_maximum = document.createElement('div')
        let e_title_increment = document.createElement('div')
        let e_title_cv = document.createElement('div')
        let input_div = document.createElement('div')
        let common_input_variable = document.createElement('div')
        let common_input_minimum = document.createElement('div')
        let common_input_maximum = document.createElement('div')
        let common_input_increment = document.createElement('div')
        let common_input_cv = document.createElement('div')
        let input_variable = document.createElement('input')
        let input_minimum = document.createElement('input')
        let input_maximum = document.createElement('input')
        let input_increment = document.createElement('input')
        let input_cv = document.createElement('input')
        let confirm_button_div = document.createElement('div')
        let cb_div = document.createElement('div')

        window.classList.value = 'window'
        win.classList.value = 'win'
        title.classList.value = 'title'
        inputs_form.classList.value = 'inputs-form'
        title_div.classList.value = 'title-div'
        e_title_variable.classList.value = 'e-title'
        e_title_minimum.classList.value = 'e-title'
        e_title_maximum.classList.value = 'e-title'
        e_title_increment.classList.value = 'e-title'
        e_title_cv.classList.value = 'e-title'
        input_div.classList.value = 'input-div'
        common_input_variable.classList.value = 'common-input'
        common_input_minimum.classList.value = 'common-input'
        common_input_maximum.classList.value = 'common-input'
        common_input_increment.classList.value = 'common-input'
        common_input_cv.classList.value = 'common-input'
        input_variable.classList.value = 'input'
        input_minimum.classList.value = 'input'
        confirm_button_div.classList.value = 'confirm-button'
        cb_div.classList.value = 'cb'

        input_minimum.type = 'number'
        input_maximum.classList.value = 'input'
        input_maximum.type = 'number'
        input_increment.classList.value = 'input'
        input_increment.type = 'number'
        input_cv.classList.value = 'input'
        input_cv.type = 'number'

        input_variable.value = this.variable_name
        input_variable.readOnly = true
        input_minimum.value = this.range.low
        input_maximum.value = this.range.high
        input_increment.value = this.increment
        input_cv.value = this.current_value

        title.appendChild(document.createTextNode('Variable Window'))
        e_title_variable.appendChild(document.createTextNode('Variable'))
        e_title_minimum.appendChild(document.createTextNode('Minimum'))
        e_title_maximum.appendChild(document.createTextNode('Maximum'))
        e_title_increment.appendChild(document.createTextNode('Increment'))
        e_title_cv.appendChild(document.createTextNode('Current Value'))
        cb_div.appendChild(document.createTextNode('Confirm'))

        confirm_button_div.appendChild(cb_div)

        common_input_variable.appendChild(input_variable)
        common_input_minimum.appendChild(input_minimum)
        common_input_maximum.appendChild(input_maximum)
        common_input_increment.appendChild(input_increment)
        common_input_cv.appendChild(input_cv)

        input_div.appendChild(common_input_variable)
        input_div.appendChild(common_input_minimum)
        input_div.appendChild(common_input_maximum)
        input_div.appendChild(common_input_increment)
        input_div.appendChild(common_input_cv)

        title_div.appendChild(e_title_variable)
        title_div.appendChild(e_title_minimum)
        title_div.appendChild(e_title_maximum)
        title_div.appendChild(e_title_increment)
        title_div.appendChild(e_title_cv)

        inputs_form.appendChild(title_div)
        inputs_form.appendChild(input_div)

        win.appendChild(title)

        window.appendChild(win)
        window.appendChild(inputs_form)
        window.appendChild(confirm_button_div)

        let editor = document.getElementById('editor')
        editor.appendChild(window)

        let v = this
        cb_div.onclick = function (){
            v.range.low = parseFloat(input_minimum.value)
            v.range.high = parseFloat(input_maximum.value)
            v.increment = parseFloat(input_increment.value)

            let cv = parseFloat(input_cv.value)
            if(cv > v.range.high){v.current_value = v.range.high}else if(cv < v.range.low){v.current_value = v.range.low}else{v.current_value = cv}
            $('#variable_input_' + v.variable_name).val(v.current_value)

            $("#variable_slider_" + v.variable_name).slider('option', 'value', v.current_value)
            $("#variable_slider_" + v.variable_name).slider('option', 'step', v.increment)
            $("#variable_slider_" + v.variable_name).slider('option', 'min', v.range.low)
            $("#variable_slider_" + v.variable_name).slider('option', 'max', v.range.high)
            v.ReCalculate_variable_changed()
            editor.removeChild(window)
        }
    }
}
class Point extends Graph{
    type = 'Point'
    P
    Basic_to = []
    Attached_to = []
    name = ''
    name_element
    constructor(P) {
        super();
        this.P = P
        let div_obj = document.createElement("div")
        let C = document.createTextNode('Point')
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)
        div_obj.appendChild(C)
        this.div_obj = div_obj
        let p = this
        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        let x = this.P.cx.baseVal.value + 10
        let y = this.P.cy.baseVal.value + 15
        this.name_element = create_elements.create_text(x,y,svg_texts,'black','')
        this.name_element.setAttribute('font-size', '20')
        this.name_element.setAttribute('class','static_text')
    }
    isMouseOn(){
        let mouseover = false
        this.P.onmouseover = function (){
            this.style.cursor = 'default'
            mouseover = true

        }
        this.P.onmouseout = function (){
            mouseover = false
        }
        return mouseover
    }
    show_property(){
        let name_div  = document.createElement('div')
        name_div.appendChild(document.createTextNode('Name:'))
        let name_input = document.createElement('input')
        name_input.value = this.name
        let p = this
        name_input.onkeydown = function (event){
            if(event.keyCode === 13){
                p.name = name_input.value
                p.name_element.textContent = p.name
            }
        }

        property_window.appendChild(name_div)
        property_window.appendChild(name_input)

    }
    chosen_switch(){
        methods.clear_property_window()
        if(this.chosen){
            this.chosen = false
            for (let k in selected_points){
                if(selected_points[k].P === this){
                    selected_points.splice(k,1)
                }
            }
            this.P.setAttribute('fill', 'red')
            this.div_obj.style.backgroundColor = 'white'
        }
        else{
            this.chosen = true
            if(this.Attached_to.length > 0){
                selected_points.unshift({
                    P:this,
                    x:this.P.cx.baseVal.value,
                    y:this.P.cy.baseVal.value
                })
            }else {
                selected_points.push({
                    P: this,
                    x: this.P.cx.baseVal.value,
                    y: this.P.cy.baseVal.value
                })
            }
            this.P.setAttribute('fill', 'green')
            this.div_obj.style.backgroundColor = 'red'
            this.show_property()
        }
    }
    ReCalculate_text_position(x, y){
        this.name_element.setAttribute('x',x)
        this.name_element.setAttribute('y',y)
    }
    ReCalculate_Attached(x, y){

        if(this.Attached_to[0].info.type === 'Mid_Point'){
            let x1 = this.Attached_to[0].object.L.x1.baseVal.value
            let y1 = this.Attached_to[0].object.L.y1.baseVal.value
            let x2 = this.Attached_to[0].object.L.x2.baseVal.value
            let y2 = this.Attached_to[0].object.L.y2.baseVal.value
            let X = (x1 + x2)/2
            let Y = (y1 + y2)/2
            this.P.setAttribute('cx', X)
            this.P.setAttribute('cy', Y)
            this.ReCalculate_text_position(X+10, Y+15)
        } else if(this.Attached_to[0].info.type === 'Intersection'){
            if(this.Attached_to[0].info.itsc_type === 'Line_Line'){
                let A1 = this.Attached_to[0].object[0].A
                let A2 = this.Attached_to[0].object[1].A
                let C1 = this.Attached_to[0].object[0].C
                let C2 = this.Attached_to[0].object[1].C
                let X = (C2-C1)/(A1-A2)
                let Y = A1*X + C1
                let obj = trans_coord.GTL(X,Y)
                this.P.setAttribute('cx', obj.lx)
                this.P.setAttribute('cy', obj.ly)
                this.ReCalculate_text_position(obj.lx+10, obj.ly+15)
            }else if(this.Attached_to[0].info.itsc_type === 'Line_Circle'){
                let A,C,xr,yr,r
                let line_idx = 0
                let circle_idx = 1
                if(this.Attached_to[0].object[0].type === 'Circle'){
                    line_idx = 1
                    circle_idx = 0
                }
                A = (this.Attached_to[0].object[line_idx].P1.P.cy.baseVal.value - this.Attached_to[0].object[line_idx].P2.P.cy.baseVal.value)/(this.Attached_to[0].object[line_idx].P1.P.cx.baseVal.value - this.Attached_to[0].object[line_idx].P2.P.cx.baseVal.value)
                C = this.Attached_to[0].object[line_idx].P1.P.cy.baseVal.value -  A * this.Attached_to[0].object[line_idx].P1.P.cx.baseVal.value
                xr = this.Attached_to[0].object[circle_idx].Pr.P.cx.baseVal.value
                yr = this.Attached_to[0].object[circle_idx].Pr.P.cy.baseVal.value
                r = this.Attached_to[0].object[circle_idx].C.r.baseVal.value

                console.log(A,C,xr,yr,r)
                let a = A*A + 1
                let b = -2 * (xr + A * (yr - C))
                let c = xr * xr + (C - yr) * (C - yr) - r * r
                if(b*b - 4*a*c < 0){this.P.setAttribute('visibility', 'hidden');return}
                let X1 = (-b + Math.sqrt(b*b - 4*a*c))/ (2*a)
                let X2 = (-b - Math.sqrt(b*b - 4*a*c))/ (2*a)
                let Y1 = A * X1 + C
                let Y2 = A * X2 + C
                let xp = this.P.cx.baseVal.value
                let yp = this.P.cy.baseVal.value
                let d1 = Math.sqrt((X1-xp)*(X1-xp) + (Y1-yp)*(Y1-yp))
                let d2 = Math.sqrt((X2-xp)*(X2-xp) + (Y2-yp)*(Y2-yp))
                if(d1 > d2){
                    this.P.setAttribute('visibility', 'visible')
                    this.P.setAttribute('cx', X2)
                    this.P.setAttribute('cy', Y2)
                    this.ReCalculate_text_position(X2+10, Y2+15)
                }else{
                    this.P.setAttribute('visibility', 'visible')
                    this.P.setAttribute('cx', X1)
                    this.P.setAttribute('cy', Y1)
                    this.ReCalculate_text_position(X1+10, Y1+15)
                }
            }else if(this.Attached_to[0].info.itsc_type === 'Circle_Circle'){
                let A,C,x1,y1,x2,y2,r1,r2
                x1 = this.Attached_to[0].object[0].Pr.P.cx.baseVal.value
                x2 = this.Attached_to[0].object[1].Pr.P.cx.baseVal.value
                y1 = this.Attached_to[0].object[0].Pr.P.cy.baseVal.value
                y2 = this.Attached_to[0].object[1].Pr.P.cy.baseVal.value
                r1 = this.Attached_to[0].object[0].C.r.baseVal.value
                r2 = this.Attached_to[0].object[1].C.r.baseVal.value

                A = (x1 - x2) / (y2 - y1)
                C = (r1*r1 - r2*r2 - x1*x1 - y1*y1 + x2*x2 + y2*y2) / (2 * (y2 - y1))

                let a = A*A + 1
                let b = -2 * (x1 + A * (y1 - C))
                let c = x1 * x1 + (C - y1) * (C - y1) - r1 * r1
                if(b*b - 4*a*c < 0){this.P.setAttribute('visibility', 'hidden');return}
                let X1 = (-b + Math.sqrt(b*b - 4*a*c))/ (2*a)
                let X2 = (-b - Math.sqrt(b*b - 4*a*c))/ (2*a)
                let Y1 = A * X1 + C
                let Y2 = A * X2 + C
                let xp = this.P.cx.baseVal.value
                let yp = this.P.cy.baseVal.value
                let d1 = Math.sqrt((X1-xp)*(X1-xp) + (Y1-yp)*(Y1-yp))
                let d2 = Math.sqrt((X2-xp)*(X2-xp) + (Y2-yp)*(Y2-yp))
                if(d1 > d2){
                    this.P.setAttribute('visibility', 'visible')
                    this.P.setAttribute('cx', X2)
                    this.P.setAttribute('cy', Y2)
                    this.ReCalculate_text_position(X2+10, Y2+15)
                }else{
                    this.P.setAttribute('visibility', 'visible')
                    this.P.setAttribute('cx', X1)
                    this.P.setAttribute('cy', Y1)
                    this.ReCalculate_text_position(X1+10, Y1+15)
                }
            }
        }else {
            this.P.setAttribute('cx', x)
            this.P.setAttribute('cy', y)
            this.ReCalculate_text_position(x+10, y+15)
        }
        //this.P.setAttribute('cx', x)
        //this.P.setAttribute('cy', y)
        for(let i in this.Basic_to){
            this.Basic_to[i].ReCalculate_not_chosen()
        }


    }
    ReCalculate_chosen(x, y){
        let obj = trans_coord.LTG(x,y)
        if(this.Attached_to.length > 0){
            if(this.Attached_to[0].info.type === 'Line'){
                if(this.Attached_to[0].object.pb_to !== undefined){
                    if(this.Attached_to[0].object.chosen){console.log('tt');return}
                    let A = this.Attached_to[0].object.A
                    let C = this.Attached_to[0].object.C
                    let A_ = -1 / A
                    let C_ = obj.gy - A_ * obj.gx
                    let X = -(C-C_)/(A-A_)
                    let Y = A*X+C

                    let OBJ = trans_coord.GTL(X,Y)
                    this.Attached_to[0].info.ratio = (OBJ.lx-this.Attached_to[0].object.L.x1.baseVal.value)/(this.Attached_to[0].object.L.x2.baseVal.value-this.Attached_to[0].object.L.x1.baseVal.value)
                    if(this.Attached_to[0].info.ratio >=1 ){
                        this.P.setAttribute('cx',this.Attached_to[0].object.L.x2.baseVal.value)
                        this.P.setAttribute('cy',this.Attached_to[0].object.L.y2.baseVal.value)
                        this.ReCalculate_text_position(this.Attached_to[0].object.L.x2.baseVal.value+10, this.Attached_to[0].object.L.y2.baseVal.value+15)
                    }else if(this.Attached_to[0].info.ratio <= 0){
                        this.P.setAttribute('cx',this.Attached_to[0].object.L.x1.baseVal.value)
                        this.P.setAttribute('cy',this.Attached_to[0].object.L.y1.baseVal.value)
                        this.ReCalculate_text_position(this.Attached_to[0].object.L.x1.baseVal.value+10, this.Attached_to[0].object.L.y1.baseVal.value+15)
                    }else{
                        this.P.setAttribute('cx',OBJ.lx)
                        this.P.setAttribute('cy',OBJ.ly)
                        this.ReCalculate_text_position(OBJ.lx+10, OBJ.ly+15)
                    }
                    for(let i in this.Basic_to){
                        this.Basic_to[i].ReCalculate_not_chosen()
                    }
                    return
                }
                if(this.Attached_to[0].object.chosen ||this.Attached_to[0].object.P1.chosen || this.Attached_to[0].object.P2.chosen){
                    if(this.Attached_to[0].object.chosen){console.log('tt');return}
                    let bias_x = x - this.P.cx.baseVal.value
                    let bias_y = y - this.P.cy.baseVal.value
                    let x1 = this.Attached_to[0].object.P1.P.cx.baseVal.value
                    let y1 = this.Attached_to[0].object.P1.P.cy.baseVal.value
                    let x2 = this.Attached_to[0].object.P2.P.cx.baseVal.value
                    let y2 = this.Attached_to[0].object.P2.P.cy.baseVal.value

                    this.Attached_to[0].object.P1.ReCalculate_chosen(x1+bias_x, y1+bias_y)
                    this.Attached_to[0].object.P2.ReCalculate_chosen(x2+bias_x, y2+bias_y)

                    this.P.setAttribute('cx',x)
                    this.P.setAttribute('cy',y)
                    this.ReCalculate_text_position(x+10, y+15)
                    for(let i in this.Basic_to){
                        this.Basic_to[i].ReCalculate_not_chosen()
                    }
                    return
                }

                let A = this.Attached_to[0].object.A
                let C = this.Attached_to[0].object.C
                let A_ = -1 / A
                let C_ = obj.gy - A_ * obj.gx
                let X = -(C-C_)/(A-A_)
                let Y = A*X+C

                let OBJ = trans_coord.GTL(X,Y)
                this.Attached_to[0].info.ratio = (OBJ.lx-this.Attached_to[0].object.L.x1.baseVal.value)/(this.Attached_to[0].object.L.x2.baseVal.value-this.Attached_to[0].object.L.x1.baseVal.value)
                if(this.Attached_to[0].info.ratio >=1 ){
                    this.P.setAttribute('cx',this.Attached_to[0].object.L.x2.baseVal.value)
                    this.P.setAttribute('cy',this.Attached_to[0].object.L.y2.baseVal.value)
                    this.ReCalculate_text_position(this.Attached_to[0].object.L.x2.baseVal.value+10, this.Attached_to[0].object.L.y2.baseVal.value+15)
                }else if(this.Attached_to[0].info.ratio <= 0){
                    this.P.setAttribute('cx',this.Attached_to[0].object.L.x1.baseVal.value)
                    this.P.setAttribute('cy',this.Attached_to[0].object.L.y1.baseVal.value)
                    this.ReCalculate_text_position(this.Attached_to[0].object.L.x1.baseVal.value+10, this.Attached_to[0].object.L.y1.baseVal.value+15)
                }else{
                    this.P.setAttribute('cx',OBJ.lx)
                    this.P.setAttribute('cy',OBJ.ly)
                    this.ReCalculate_text_position(OBJ.lx+10, OBJ.ly+15)
                }
                for(let i in this.Basic_to){
                    this.Basic_to[i].ReCalculate_not_chosen()
                }
                return
            }else if(this.Attached_to[0].info.type === 'Circle'){

                if(this.Attached_to[0].object.chosen ||this.Attached_to[0].object.Pr.chosen || this.Attached_to[0].object.Pb.chosen){
                    if(this.Attached_to[0].object.chosen){console.log('tt');return}
                    let bias_x = x - this.P.cx.baseVal.value
                    let bias_y = y - this.P.cy.baseVal.value

                    let xr = this.Attached_to[0].object.Pr.P.cx.baseVal.value
                    let yr = this.Attached_to[0].object.Pr.P.cy.baseVal.value
                    let xb = this.Attached_to[0].object.Pb.P.cx.baseVal.value
                    let yb = this.Attached_to[0].object.Pb.P.cy.baseVal.value

                    /*
                    if (this.Attached_to[0].object.Pr.chosen && !this.Attached_to[0].object.Pb.chosen) {
                        this.Attached_to[0].object.Pb.ReCalculate_chosen(xr + r2b_bias_x, yr + r2b_bias_y)
                        let new_xb = this.Attached_to[0].object.Pb.P.cx.baseVal.value
                        let new_yb = this.Attached_to[0].object.Pb.P.cy.baseVal.value
                        this.Attached_to[0].object.Pr.ReCalculate_chosen(new_xb - r2b_bias_x, new_yb - r2b_bias_y)
                    } else if (!this.Attached_to[0].object.Pr.chosen && this.Attached_to[0].object.Pb.chosen) {
                        this.Attached_to[0].object.Pr.ReCalculate_chosen(xb - r2b_bias_x, yb - r2b_bias_y)
                        let new_xr = this.Attached_to[0].object.Pr.P.cx.baseVal.value
                        let new_yr = this.Attached_to[0].object.Pr.P.cy.baseVal.value
                        this.Attached_to[0].object.Pb.ReCalculate_chosen(new_xr + r2b_bias_x, new_yr + r2b_bias_y)
                    }*/

                    this.Attached_to[0].object.Pr.ReCalculate_chosen(xr+bias_x, yr+bias_y)
                    this.Attached_to[0].object.Pb.ReCalculate_chosen(xb+bias_x, yb+bias_y)
                    //let X = this.Attached_to[0].object.Pr.P.cx.baseVal.value + this.Attached_to[0].info.cos_value * this.Attached_to[0].object.C.r.baseVal.value
                    //let Y = this.Attached_to[0].object.Pr.P.cy.baseVal.value - this.Attached_to[0].info.sin_value * this.Attached_to[0].object.C.r.baseVal.value
                    this.P.setAttribute('cx',x)
                    this.P.setAttribute('cy',y)
                    this.ReCalculate_text_position(x+10, y+15)
                    for(let i in this.Basic_to){
                        this.Basic_to[i].ReCalculate_not_chosen()
                    }
                    return
                }

                let r = this.Attached_to[0].object.C.r.baseVal.value
                let rx = this.Attached_to[0].object.C.cx.baseVal.value
                let ry = this.Attached_to[0].object.C.cy.baseVal.value
                let cos_value = (x-rx)/ Math.sqrt((x-rx)*(x-rx) + (y-ry)*(y-ry))
                let sin_value = -(y-ry)/ Math.sqrt((x-rx)*(x-rx) + (y-ry)*(y-ry))

                let X = rx + r*cos_value
                let Y = ry - r*sin_value

                this.Attached_to[0].info.cos_value = cos_value
                this.Attached_to[0].info.sin_value = sin_value
                this.P.setAttribute('cx',X)
                this.P.setAttribute('cy',Y)
                this.ReCalculate_text_position(X+10, Y+15)
                for(let i in this.Basic_to){
                    this.Basic_to[i].ReCalculate_not_chosen()
                }
                return
            }else if(this.Attached_to[0].info.type === 'Curve'){
                let len = this.Attached_to[0].object.path_lines.xl.length
                let X,Y
                if(x < this.Attached_to[0].object.path_lines.xl[0]){
                    X = this.Attached_to[0].object.path_lines.xl[0]
                    Y = this.Attached_to[0].object.path_lines.yl[0]
                }else if(x > this.Attached_to[0].object.path_lines.xr[len-1]){
                    X = this.Attached_to[0].object.path_lines.xr[len-1]
                    Y = this.Attached_to[0].object.path_lines.yr[len-1]
                }else{
                    for(let i = 0; i < len; ++i){
                        if(x > this.Attached_to[0].object.path_lines.xl[i] && x <= this.Attached_to[0].object.path_lines.xr[i]){
                            let x1 = this.Attached_to[0].object.path_lines.xl[i]
                            let y1 = this.Attached_to[0].object.path_lines.yl[i]
                            let x2 = this.Attached_to[0].object.path_lines.xr[i]
                            let y2 = this.Attached_to[0].object.path_lines.yr[i]

                            let A = (y2-y1)/(x2-x1)
                            let C = (x2*y1-x1*y2)/(x2-x1)
                            X = x
                            Y = A*x + C
                        }
                    }
                }
                this.P.setAttribute('cx',X)
                this.P.setAttribute('cy',Y)
                this.ReCalculate_text_position(X+10, Y+15)
                for(let i in this.Basic_to){
                    this.Basic_to[i].ReCalculate_not_chosen()
                }
                return
            }else if(this.Attached_to[0].info.type === 'Intersection'){
                let bias_x = x - this.P.cx.baseVal.value
                let bias_y = y - this.P.cy.baseVal.value
                for(let i = 0; i < 2; ++i){
                    if(this.Attached_to[0].object[i].type === 'Line'){

                        let x1 = this.Attached_to[0].object[i].P1.P.cx.baseVal.value
                        let y1 = this.Attached_to[0].object[i].P1.P.cy.baseVal.value
                        let x2 = this.Attached_to[0].object[i].P2.P.cx.baseVal.value
                        let y2 = this.Attached_to[0].object[i].P2.P.cy.baseVal.value
                        /*
                        if(this.Attached_to[0].object.P1.chosen && !this.Attached_to[0].object.P2.chosen){
                            this.Attached_to[0].object.P2.ReCalculate_chosen(x2+bias_x, y2+bias_y)
                        }else if(!this.Attached_to[0].object.P1.chosen && this.Attached_to[0].object.P2.chosen){
                            this.Attached_to[0].object.P1.ReCalculate_chosen(x1+bias_x, y1+bias_y)
                        }*/
                        this.Attached_to[0].object[i].P1.ReCalculate_chosen(x1+bias_x, y1+bias_y)
                        this.Attached_to[0].object[i].P2.ReCalculate_chosen(x2+bias_x, y2+bias_y)
                        //let X = this.Attached_to[0].object.P1.P.cx.baseVal.value + this.Attached_to[0].info.ratio * (this.Attached_to[0].object.P2.P.cx.baseVal.value - this.Attached_to[0].object.P1.P.cx.baseVal.value)
                        //let Y = this.Attached_to[0].object.P1.P.cy.baseVal.value + this.Attached_to[0].info.ratio * (this.Attached_to[0].object.P2.P.cy.baseVal.value - this.Attached_to[0].object.P1.P.cy.baseVal.value)
                        this.P.setAttribute('cx',x)
                        this.P.setAttribute('cy',y)
                        this.ReCalculate_text_position(x+10, y+15)
                        for(let i in this.Basic_to){
                            this.Basic_to[i].ReCalculate_not_chosen()
                        }

                    }else if(this.Attached_to[0].object[i].type === 'Circle'){

                        let xr = this.Attached_to[0].object[i].Pr.P.cx.baseVal.value
                        let yr = this.Attached_to[0].object[i].Pr.P.cy.baseVal.value
                        let xb = this.Attached_to[0].object[i].Pb.P.cx.baseVal.value
                        let yb = this.Attached_to[0].object[i].Pb.P.cy.baseVal.value

                        /*
                        if (this.Attached_to[0].object.Pr.chosen && !this.Attached_to[0].object.Pb.chosen) {
                            this.Attached_to[0].object.Pb.ReCalculate_chosen(xr + r2b_bias_x, yr + r2b_bias_y)
                            let new_xb = this.Attached_to[0].object.Pb.P.cx.baseVal.value
                            let new_yb = this.Attached_to[0].object.Pb.P.cy.baseVal.value
                            this.Attached_to[0].object.Pr.ReCalculate_chosen(new_xb - r2b_bias_x, new_yb - r2b_bias_y)
                        } else if (!this.Attached_to[0].object.Pr.chosen && this.Attached_to[0].object.Pb.chosen) {
                            this.Attached_to[0].object.Pr.ReCalculate_chosen(xb - r2b_bias_x, yb - r2b_bias_y)
                            let new_xr = this.Attached_to[0].object.Pr.P.cx.baseVal.value
                            let new_yr = this.Attached_to[0].object.Pr.P.cy.baseVal.value
                            this.Attached_to[0].object.Pb.ReCalculate_chosen(new_xr + r2b_bias_x, new_yr + r2b_bias_y)
                        }*/

                        this.Attached_to[0].object[i].Pr.ReCalculate_chosen(xr+bias_x, yr+bias_y)
                        this.Attached_to[0].object[i].Pb.ReCalculate_chosen(xb+bias_x, yb+bias_y)
                        //let X = this.Attached_to[0].object.Pr.P.cx.baseVal.value + this.Attached_to[0].info.cos_value * this.Attached_to[0].object.C.r.baseVal.value
                        //let Y = this.Attached_to[0].object.Pr.P.cy.baseVal.value - this.Attached_to[0].info.sin_value * this.Attached_to[0].object.C.r.baseVal.value
                        this.P.setAttribute('cx',x)
                        this.P.setAttribute('cy',y)
                        this.ReCalculate_text_position(x+10, y+15)
                        for(let i in this.Basic_to){
                            this.Basic_to[i].ReCalculate_not_chosen()
                        }

                    }
                }
                return
            }else if(this.Attached_to[0].info.type === 'Mid_Point'){
                let bias_x = x - this.P.cx.baseVal.value
                let bias_y = y - this.P.cy.baseVal.value
                let x1 = this.Attached_to[0].object.P1.P.cx.baseVal.value
                let y1 = this.Attached_to[0].object.P1.P.cy.baseVal.value
                let x2 = this.Attached_to[0].object.P2.P.cx.baseVal.value
                let y2 = this.Attached_to[0].object.P2.P.cy.baseVal.value

                this.Attached_to[0].object.P1.ReCalculate_chosen(x1+bias_x, y1+bias_y)
                this.Attached_to[0].object.P2.ReCalculate_chosen(x2+bias_x, y2+bias_y)

                this.P.setAttribute('cx',x)
                this.P.setAttribute('cy',y)
                this.ReCalculate_text_position(x+10, y+15)
                for(let i in this.Basic_to){
                    this.Basic_to[i].ReCalculate_not_chosen()
                }
            }

        }
        this.P.setAttribute('cx',x)
        this.P.setAttribute('cy',y)
        this.ReCalculate_text_position(x+10, y+15)
        for(let i in this.Basic_to){
            this.Basic_to[i].ReCalculate_not_chosen()
        }
    }
    Delete(){
        while(this.Basic_to.length > 0){
            this.Basic_to[0].Delete()
        }


        svg_points.removeChild(this.P)
        for(let i in graph.Points){
            if(this === graph.Points[i]){graph.Points.splice(i, 1)}
        }
        for(let i in graph.elements){
            if(this.P === graph.elements[i]){graph.elements.splice(i, 1)}
        }
        obj_list.removeChild(this.div_obj)

    }
}
class Line extends Graph{
    type = 'Line'
    L
    P1
    P2
    A
    B
    C
    Attached_Points = []
    Attached_Lines = []
    pb_to
    constructor(L,P1,P2) {
        super();
        this.L = L
        this.P1 = P1
        this.P2 = P2

        let x1 = this.L.x1.baseVal.value
        let y1 = this.L.y1.baseVal.value
        let x2 = this.L.x2.baseVal.value
        let y2 = this.L.y2.baseVal.value
        let obj1 = trans_coord.LTG(x1,y1)
        let obj2 = trans_coord.LTG(x2,y2)
        x1=obj1.gx
        y1=obj1.gy
        x2=obj2.gx
        y2=obj2.gy
        this.A = (y2-y1)/(x2-x1)
        this.B = -1
        this.C = (x2*y1-x1*y2)/(x2-x1)

        let div_obj = document.createElement("div")
        let C = document.createTextNode('Line')
        let cb = document.createElement('input')
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        this.tracks = g
        svg_tracks.appendChild(g)
        cb.type = 'checkbox'
        cb.name = 'track-cb'
        cb.value = 'track-cb'
        cb.classList.value = 'track-cb'
        this.tracks_checkbox = cb
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)

        div_obj.appendChild(C)
        //div_obj.appendChild(cb)

        this.div_obj = div_obj
        let p = this
        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        cb.onchange = function (){
            if(!cb.checked){
                while(g.firstChild){
                    g.removeChild(g.firstChild)
                }
            }
        }
    }

    show_property(){
        let mid_point_button = document.createElement('button')
        mid_point_button.appendChild(document.createTextNode('Middle Point'))
        let perpendicular_bisector_button = document.createElement('button')
        perpendicular_bisector_button.appendChild(document.createTextNode('Perpendicular Bisector'))
        let p = this
        mid_point_button.onclick = function (){
            let x1 = p.L.x1.baseVal.value
            let x2 = p.L.x2.baseVal.value
            let y1 = p.L.y1.baseVal.value
            let y2 = p.L.y2.baseVal.value
            let x = (x1 + x2) / 2
            let y = (y1 + y2) / 2
            let P = create_elements.create_point(x, y, svg_points,'red')
            let PP = new Point(P)
            PP.Attached_to.push({
                object:p,
                info:{
                    type: 'Mid_Point',
                }
            })
            p.Attached_Points.push(PP)
            graph.add_point(PP)
            graph.elements.push(P)
        }
        perpendicular_bisector_button.onclick = function (){
            let x1 = p.L.x1.baseVal.value
            let x2 = p.L.x2.baseVal.value
            let y1 = p.L.y1.baseVal.value
            let y2 = p.L.y2.baseVal.value
            let x = (x1 + x2) / 2
            let y = (y1 + y2) / 2
            let P = create_elements.create_point(x, y, svg_points,'red')
            let PP = new Point(P)
            PP.Attached_to.push({
                object:p,
                info:{
                    type: 'Mid_Point',
                }
            })
            p.Attached_Points.push(PP)
            graph.add_point(PP)
            graph.elements.push(P)

            let obj = trans_coord.LTG(x,y)
            let a = -1/p.A
            let c = obj.gy - a*obj.gx

            let X1 = obj.gx - 25/Math.sqrt(a*a+1)
            let X2 = obj.gx + 25/Math.sqrt(a*a+1)

            let Y1 = a*X1 + c
            let Y2 = a*X2 + c

            let OBJ1 = trans_coord.GTL(X1,Y1)
            let OBJ2 = trans_coord.GTL(X2,Y2)
            let line = create_elements.create_line(OBJ1.lx, OBJ2.lx, OBJ1.ly, OBJ2.ly, svg_others, 'blue')
            let l = new Line(line, undefined, undefined)
            graph.elements.push(line)
            graph.add_line(l)
            l.pb_to = PP
            p.Attached_Lines.push(l)
        }

        let track_div = document.createElement('div')
        track_div.appendChild(document.createTextNode('Tracks(√ for open, × for close):'))
        let cb = this.tracks_checkbox
        track_div.appendChild(cb)
        property_window.appendChild(mid_point_button)
        property_window.appendChild(perpendicular_bisector_button)
        property_window.appendChild(track_div)
    }
    chosen_switch(){
        methods.clear_property_window()
        if(this.chosen){
            this.chosen = false
            for (let k in selected_lines){
                if(selected_lines[k].L === this){
                    selected_lines.splice(k,1)
                }
            }
            this.L.setAttribute('stroke', 'blue')
            this.div_obj.style.backgroundColor = 'white'
        }
        else{
            this.chosen = true
            selected_lines.push({
                L:this,
                x1:this.L.x1.baseVal.value,
                y1:this.L.y1.baseVal.value,
                x2:this.L.x2.baseVal.value,
                y2:this.L.y2.baseVal.value
            })
            this.L.setAttribute('stroke', 'green')
            this.div_obj.style.backgroundColor = 'red'
            this.show_property()
        }
    }
    is_mouse_on(x, y){
        let mouse_on = false

        let x1 = this.L.x1.baseVal.value
        let y1 = this.L.y1.baseVal.value
        let x2 = this.L.x2.baseVal.value
        let y2 = this.L.y2.baseVal.value
        let obj = trans_coord.LTG(x,y)
        let obj1 = trans_coord.LTG(x1,y1)
        let obj2 = trans_coord.LTG(x2,y2)
        x1=obj1.gx
        y1=obj1.gy
        x2=obj2.gx
        y2=obj2.gy
        x=obj.gx
        y=obj.gy
        let d = Math.abs(this.A*x+this.B*y+this.C)/Math.sqrt(this.A*this.A+this.B*this.B)
        let cos1 = ((x1-x2)*(x1-x)+(y1-y2)*(y1-y))/(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))*Math.sqrt((x1-x)*(x1-x)+(y1-y)*(y1-y)))
        let cos2 = ((x2-x1)*(x2-x)+(y2-y1)*(y2-y))/(Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))*Math.sqrt((x2-x)*(x2-x)+(y2-y)*(y2-y)))
        console.log(d)
        if( d<=0.02 && cos1>0 && cos2>0 ){mouse_on=true}
        console.log(mouse_on)
        return mouse_on
    }
    ReCalculate_not_chosen(){
        let track_status = methods.get_track_status(this)
        if(track_status){
            create_elements.create_line(this.L.x1.baseVal.value, this.L.x2.baseVal.value, this.L.y1.baseVal.value, this.L.y2.baseVal.value, this.tracks, 'purple')
        }
        let x1 = this.P1.P.cx.baseVal.value
        let y1 = this.P1.P.cy.baseVal.value
        let x2 = this.P2.P.cx.baseVal.value
        let y2 = this.P2.P.cy.baseVal.value

        let obj1 = trans_coord.LTG(x1,y1)
        let obj2 = trans_coord.LTG(x2,y2)

        this.A = (obj2.gy-obj1.gy)/(obj2.gx-obj1.gx)
        this.C = (obj2.gx*obj1.gy-obj1.gx*obj2.gy)/(obj2.gx-obj1.gx)

        this.L.setAttribute('x1', this.P1.P.cx.baseVal.value)
        this.L.setAttribute('y1', this.P1.P.cy.baseVal.value)
        this.L.setAttribute('x2', this.P2.P.cx.baseVal.value)
        this.L.setAttribute('y2', this.P2.P.cy.baseVal.value)

        for (let i in this.Attached_Points){
            let ratio = this.Attached_Points[i].Attached_to[0].info.ratio
            console.log(ratio)
            let x = x1 + ratio*(x2-x1)
            let y = y1 + ratio*(y2-y1)
            this.Attached_Points[i].ReCalculate_Attached(x,y)
        }
        for (let i in this.Attached_Lines){
            let x = (x1 + x2) / 2
            let y = (y1 + y2) / 2
            let obj = trans_coord.LTG(x,y)
            let a = -1/this.A
            let c = obj.gy - a*obj.gx
            let X1 = obj.gx - 25/Math.sqrt(a*a+1)
            let X2 = obj.gx + 25/Math.sqrt(a*a+1)
            let Y1 = a*X1 + c
            let Y2 = a*X2 + c
            let OBJ1 = trans_coord.GTL(X1,Y1)
            let OBJ2 = trans_coord.GTL(X2,Y2)

            this.Attached_Lines[i].A = a
            this.Attached_Lines[i].C = c


            this.Attached_Lines[i].L.setAttribute('x1', OBJ1.lx)
            this.Attached_Lines[i].L.setAttribute('x2', OBJ2.lx)
            this.Attached_Lines[i].L.setAttribute('y1', OBJ1.ly)
            this.Attached_Lines[i].L.setAttribute('y2', OBJ2.ly)

            for (let j in this.Attached_Lines[i].Attached_Points){
                let ratio = this.Attached_Lines[i].Attached_Points[j].Attached_to[0].info.ratio
                console.log(ratio)
                let x = OBJ1.lx + ratio*(OBJ2.lx-OBJ1.lx)
                let y = OBJ1.ly + ratio*(OBJ2.ly-OBJ1.ly)
                this.Attached_Lines[i].Attached_Points[j].ReCalculate_Attached(x,y)
            }
        }

    }
    ReCalculate_chosen(x1,y1,x2,y2){
        let track_status = methods.get_track_status(this)
        if(track_status){
            create_elements.create_line(this.L.x1.baseVal.value, this.L.x2.baseVal.value, this.L.y1.baseVal.value, this.L.y2.baseVal.value, this.tracks, 'purple')
        }

        let bias_x = x1 - this.L.x1.baseVal.value
        let bias_y = y1 - this.L.y1.baseVal.value
        this.L.setAttribute('x1', x1)
        this.L.setAttribute('y1', y1)
        this.L.setAttribute('x2', x2)
        this.L.setAttribute('y2', y2)
        if(this.pb_to === undefined) {
            this.P1.ReCalculate_chosen(x1, y1)
            this.P2.ReCalculate_chosen(x2, y2)
        }else{
            let x = (x1+x2)/2
            let y = (y1+y2)/2
            this.pb_to.ReCalculate_chosen(x, y)
            /*
            let X_1 = this.pb_to.P1.P.cx.baseVal.value
            let Y_1 = this.pb_to.P1.P.cy.baseVal.value
            let X_2 = this.pb_to.P2.P.cx.baseVal.value
            let Y_2 = this.pb_to.P2.P.cy.baseVal.value
            this.pb_to.P1.ReCalculate_chosen(X_1+bias_x,Y_1+bias_y)
            this.pb_to.P2.ReCalculate_chosen(X_2+bias_x,Y_2+bias_y)*/
        }
        for(let i in this.Attached_Points){
            this.Attached_Points[i].ReCalculate_Attached(this.L.x1.baseVal.value+this.Attached_Points[i].Attached_to[0].info.ratio*(this.L.x2.baseVal.value-this.L.x1.baseVal.value),this.L.y1.baseVal.value+this.Attached_Points[i].Attached_to[0].info.ratio*(this.L.y2.baseVal.value-this.L.y1.baseVal.value))
        }
        let obj1 = trans_coord.LTG(x1,y1)
        let obj2 = trans_coord.LTG(x2,y2)
        this.A = (obj2.gy-obj1.gy)/(obj2.gx-obj1.gx)
        this.C = (obj2.gx*obj1.gy-obj1.gx*obj2.gy)/(obj2.gx-obj1.gx)
        for (let i in this.Attached_Lines){
            let x = (x1 + x2) / 2
            let y = (y1 + y2) / 2
            let obj = trans_coord.LTG(x,y)
            let a = -1/this.A
            let c = obj.gy - a*obj.gx
            let X1 = obj.gx - 25/Math.sqrt(a*a+1)
            let X2 = obj.gx + 25/Math.sqrt(a*a+1)
            let Y1 = a*X1 + c
            let Y2 = a*X2 + c
            let OBJ1 = trans_coord.GTL(X1,Y1)
            let OBJ2 = trans_coord.GTL(X2,Y2)

            this.Attached_Lines[i].A = a
            this.Attached_Lines[i].C = c


            this.Attached_Lines[i].L.setAttribute('x1', OBJ1.lx)
            this.Attached_Lines[i].L.setAttribute('x2', OBJ2.lx)
            this.Attached_Lines[i].L.setAttribute('y1', OBJ1.ly)
            this.Attached_Lines[i].L.setAttribute('y2', OBJ2.ly)

        }
    }
    Delete(){
        for(let i in this.Attached_Points){
            this.Attached_Points[i].Delete()
        }
        svg_others.removeChild(this.L)
        for(let i in graph.Lines){
            if(this === graph.Lines[i]){graph.Lines.splice(i, 1)}
        }
        for(let i in graph.elements){
            if(this.L === graph.elements[i]){graph.elements.splice(i, 1)}
        }
        for(let i in this.P1.Basic_to){
            if(this.P1.Basic_to[i] === this){this.P1.Basic_to.splice(i, 1)}
        }
        for(let i in this.P2.Basic_to){
            if(this.P2.Basic_to[i] === this){this.P2.Basic_to.splice(i, 1)}
        }
        obj_list.removeChild(this.div_obj)

    }

}
class Circle extends Graph{

    type = 'Circle'
    C
    Pr
    Pb
    Attached_Points = []
    constructor(C,Pr,Pb) {
        super();
        this.C = C
        this.Pr = Pr
        this.Pb = Pb

        let div_obj = document.createElement("div")
        let Ct = document.createTextNode('Circle')
        let cb = document.createElement('input')
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        this.tracks = g
        svg_tracks.appendChild(g)
        cb.type = 'checkbox'
        cb.name = 'track-cb'
        cb.value = 'track-cb'
        cb.classList.value = 'track-cb'
        this.tracks_checkbox = cb
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)

        div_obj.appendChild(Ct)
        //div_obj.appendChild(cb)
        this.div_obj = div_obj

        let p = this
        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        cb.onchange = function (){
            if(!cb.checked){
                while(g.firstChild){
                    g.removeChild(g.firstChild)
                }
            }
        }
    }
    is_mouse_on(x, y){
        let mouse_on = false

        let xr = this.C.cx.baseVal.value
        let yr = this.C.cy.baseVal.value


        let d = Math.sqrt((x-xr)*(x-xr)+(y-yr)*(y-yr))

        console.log(this.C.r.baseVal.value, d)
        if( Math.abs(this.C.r.baseVal.value-d) <= 4){mouse_on=true}
        console.log(mouse_on)
        return mouse_on
    }
    show_property(){
        let track_div = document.createElement('div')
        track_div.appendChild(document.createTextNode('Tracks(√ for open, × for close):'))
        let cb = this.tracks_checkbox
        track_div.appendChild(cb)
        property_window.appendChild(track_div)
    }
    chosen_switch(){
        methods.clear_property_window()
        if(this.chosen){
            this.chosen = false
            for (let k in selected_circles){
                if(selected_circles[k].C === this){
                    selected_circles.splice(k,1)
                }
            }
            this.C.setAttribute('stroke', 'blue')
            this.div_obj.style.backgroundColor = 'white'
        }
        else{
            this.chosen = true
            selected_circles.push({
                C:this,
                x:this.C.cx.baseVal.value,
                y:this.C.cy.baseVal.value,
                r2b_bias_x:this.Pb.P.cx.baseVal.value - this.Pr.P.cx.baseVal.value,
                r2b_bias_y:this.Pb.P.cy.baseVal.value - this.Pr.P.cy.baseVal.value
            })
            this.C.setAttribute('stroke', 'green')
            this.div_obj.style.backgroundColor = 'red'
            this.show_property()
        }
    }
    ReCalculate_not_chosen(){
        let track_status = methods.get_track_status(this)
        if(track_status){
            let circle = create_elements.create_circle(this.C.cx.baseVal.value, this.C.cy.baseVal.value, this.tracks, 'purple')
            circle.setAttribute('r', this.C.r.baseVal.value)
        }
        this.C.setAttribute('cx', this.Pr.P.cx.baseVal.value)
        this.C.setAttribute('cy', this.Pr.P.cy.baseVal.value)
        this.C.setAttribute('r', Math.sqrt(
            (this.Pr.P.cx.baseVal.value-this.Pb.P.cx.baseVal.value)*(this.Pr.P.cx.baseVal.value-this.Pb.P.cx.baseVal.value)
            +(this.Pr.P.cy.baseVal.value-this.Pb.P.cy.baseVal.value)*(this.Pr.P.cy.baseVal.value-this.Pb.P.cy.baseVal.value)
        ))

        let x1 = this.C.cx.baseVal.value
        let y1 = this.C.cy.baseVal.value
        let r = this.C.r.baseVal.value

        let renew_bias = true
        for(let i in this.Attached_Points){if(this.Attached_Points[i].chosen){renew_bias = false}}
        for (let i in this.Attached_Points){

            let cos_value = this.Attached_Points[i].Attached_to[0].info.cos_value
            let sin_value = this.Attached_Points[i].Attached_to[0].info.sin_value

            let x = x1 + r*cos_value
            let y = y1 - r*sin_value

            this.Attached_Points[i].ReCalculate_Attached(x, y)
            if(renew_bias) {
                this.Attached_Points[i].Attached_to[0].info.r2b_bias_x = this.Pb.P.cx.baseVal.value - this.Pr.P.cx.baseVal.value
                this.Attached_Points[i].Attached_to[0].info.r2b_bias_y = this.Pb.P.cy.baseVal.value - this.Pr.P.cy.baseVal.value
            }
        }


    }
    ReCalculate_chosen(x,y,r2b_bias_x,r2b_bias_y){
        let track_status = methods.get_track_status(this)
        if(track_status){
            let circle = create_elements.create_circle(this.C.cx.baseVal.value, this.C.cy.baseVal.value, this.tracks, 'purple')
            circle.setAttribute('r', this.C.r.baseVal.value)
        }
        this.Pb.ReCalculate_chosen(x+r2b_bias_x, y+r2b_bias_y)
        this.Pr.ReCalculate_chosen(x,y)
        this.C.setAttribute('cx', x)
        this.C.setAttribute('cy', y)

        for(let i in this.Attached_Points){
            let xr = this.Pr.P.cx.baseVal.value
            let yr = this.Pr.P.cy.baseVal.value
            let r = this.C.r.baseVal.value
            let cos_value = this.Attached_Points[i].Attached_to[0].info.cos_value
            let sin_value = this.Attached_Points[i].Attached_to[0].info.sin_value
            this.Attached_Points[i].ReCalculate_Attached(xr+r*cos_value,yr-r*sin_value)
        }


    }
    Delete(){
        for(let i in this.Attached_Points){
            this.Attached_Points[i].Delete()
        }
        svg_others.removeChild(this.C)
        for(let i in graph.Circles){
            if(this === graph.Circles[i]){graph.Circles.splice(i, 1)}
        }
        for(let i in graph.elements){
            if(this.C === graph.elements[i]){graph.elements.splice(i, 1)}
        }
        for(let i in this.Pr.Basic_to){
            if(this.Pr.Basic_to[i] === this){this.Pr.Basic_to.splice(i, 1)}
        }
        for(let i in this.Pb.Basic_to){
            if(this.Pb.Basic_to[i] === this){this.Pb.Basic_to.splice(i, 1)}
        }
        obj_list.removeChild(this.div_obj)

    }
}
class FunctionCurve extends Graph{
    type = 'Curve'
    expression
    x_info = {
        low:0,
        high:0,
        sample_num:0,
        threshold:0
    }
    path
    path_lines = {
        xl:[],
        yl:[],
        xr:[],
        yr:[],
    }
    Attached_Points = []
    associate_variables = []
    constructor() {
        super();

        let div_obj = document.createElement("div")
        let C = document.createTextNode('Function')
        let cb = document.createElement('input')
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        this.tracks = g
        svg_tracks.appendChild(g)
        cb.type = 'checkbox'
        cb.name = 'track-cb'
        cb.value = 'track-cb'
        cb.classList.value = 'track-cb'
        this.tracks_checkbox = cb
        div_obj.classList.value = 'element'
        obj_list.appendChild(div_obj)

        div_obj.appendChild(C)
        //div_obj.appendChild(cb)

        this.div_obj = div_obj
        let p = this
        this.div_obj.onclick = function (event){
            p.chosen_switch()
        }
        this.div_obj.ondblclick = function (event){
            p.show_function_window()
        }
        cb.onchange = function (){
            if(!cb.checked){
                while(g.firstChild){
                    g.removeChild(g.firstChild)
                }
            }
        }
    }
    is_mouse_on(x, y){
        let mouse_on = false

        for(let i in this.path_lines.xl){
            let x1 = this.path_lines.xl[i]
            let y1 = this.path_lines.yl[i]
            let x2 = this.path_lines.xr[i]
            let y2 = this.path_lines.yr[i]


            let A = (y2-y1)/(x2-x1)
            let B = -1
            let C = (x2*y1-x1*y2)/(x2-x1)
            let d = Math.abs(A*x+B*y+C)/Math.sqrt(A*A+B*B)

            let cos1 = ((x1-x2)*(x1-x)+(y1-y2)*(y1-y))/(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))*Math.sqrt((x1-x)*(x1-x)+(y1-y)*(y1-y)))
            let cos2 = ((x2-x1)*(x2-x)+(y2-y1)*(y2-y))/(Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))*Math.sqrt((x2-x)*(x2-x)+(y2-y)*(y2-y)))
            if( d<=1 && cos1>0 && cos2>0 ){
                mouse_on=true
                console.log(mouse_on)
                return mouse_on
            }
        }

        console.log(mouse_on)
        return mouse_on
    }
    show_property(){
        let track_div = document.createElement('div')
        track_div.appendChild(document.createTextNode('Tracks(√ for open, × for close):'))
        let cb = this.tracks_checkbox
        track_div.appendChild(cb)
        property_window.appendChild(track_div)
    }
    chosen_switch(){
        methods.clear_property_window()
        if(this.chosen){
            this.chosen = false
            for (let k in selected_curves){
                if(selected_curves[k].path === this){
                    selected_curves.splice(k,1)
                }
            }
            this.path.setAttribute('stroke', 'blue')
            this.div_obj.style.backgroundColor = 'white'
        }
        else{
            this.chosen = true
            selected_curves.push({
                path:this
            })
            this.path.setAttribute('stroke', 'green')
            this.div_obj.style.backgroundColor = 'red'
            this.show_property()
        }
    }
    ReCalculate(){
        let track_status = methods.get_track_status(this)
        if(track_status){
            let path = document.createElementNS('http://www.w3.org/2000/svg','path')
            path.setAttribute('d', this.path.getAttribute('d'))
            path.setAttribute('stroke', 'purple')
            this.tracks.appendChild(path)
        }
        const parser = math.parser()
        for(let i in graph.Variables){
            parser.evaluate(graph.Variables[i].variable_name+'='+graph.Variables[i].current_value.toString())
        }

        let low = this.x_info.low
        let high = this.x_info.high
        let x = low
        let y = 0
        let obj = {}
        let interval = (high - low)/this.x_info.sample_num

        let coords = []
        let y_array = []
        while(x <= high){

            parser.evaluate('x='+x.toString())
            y = parser.evaluate(this.expression)
            y_array.push(y)
            obj = trans_coord.GTL(x,y)

            coords.push({
                x:obj.lx,
                y:obj.ly
            })

            x += interval
            x = parseFloat(x.toFixed(2))
        }

        let str = 'M'+coords[0].x.toString()+' '+coords[0].y.toString()

        this.path_lines = {
            xl:[],
            yl:[],
            xr:[],
            yr:[],
        }
        this.path_lines.xl.push(coords[0].x)
        this.path_lines.yl.push(coords[0].y)
        for(let i = 1; i < coords.length; ++i){
            if(Math.abs(y_array[i] - y_array[i-1]) > this.x_info.threshold){
                str += 'M' + coords[i].x.toString() + ' ' + coords[i].y.toString()
                this.path_lines.xl.splice(this.path_lines.xl.length-1,1)
                this.path_lines.yl.splice(this.path_lines.yl.length-1,1)
                this.path_lines.xl.push(coords[i].x)
                this.path_lines.yl.push(coords[i].y)
                continue;
            }
            str += ' L' + coords[i].x.toString() + ' ' + coords[i].y.toString()
            this.path_lines.xr.push(coords[i].x)
            this.path_lines.yr.push(coords[i].y)
            this.path_lines.xl.push(coords[i].x)
            this.path_lines.yl.push(coords[i].y)
        }
        this.path_lines.xl.splice(this.path_lines.xl.length-1,1)
        this.path_lines.yl.splice(this.path_lines.yl.length-1,1)

        this.path.setAttribute('d',str)
        this.path.setAttribute('stroke','blue')

        for(let i in this.Attached_Points){
            this.Attached_Points[i].ReCalculate_chosen(this.Attached_Points[i].P.cx.baseVal.value,0)
        }
    }
    ReCalculate_function_changed(expression, x_info){
        const parser = math.parser()

        console.log(expression)
        let low = x_info.low
        let high = x_info.high
        let sample_num = x_info.sample_num
        let x = low
        let y = 0
        let obj = {}
        let interval = (high - low)/sample_num

        let coords = []
        let y_array = []

        let f_c = this

        const node = math.parse(expression)
        const filtered_symbol_nodes = node.filter(function (node) {
            return node.isSymbolNode
        })
        console.log(filtered_symbol_nodes)
        const filtered_function_nodes = node.filter(function (node) {
            return node.isFunctionNode
        })
        console.log(filtered_function_nodes)

        let variables = []
        for(let i in filtered_symbol_nodes){
            let is_function = false
            for(let j in filtered_function_nodes){
                if(filtered_symbol_nodes[i].name === filtered_function_nodes[j].fn.name){is_function=true;break}
            }
            if(is_function){}else{
                let is_listed = false
                for(let k in variables){
                    if(variables[k] === filtered_symbol_nodes[i].name){is_listed=true;break}
                }
                if(is_listed){}else{variables.push(filtered_symbol_nodes[i].name)}
            }
        }
        for(let i in variables){if(variables[i] === 'x'){variables.splice(i,1);break}}

        f_c.associate_variables = variables
        for(let i in variables){
            let is_created = false
            for(let j in graph.Variables){
                if(graph.Variables[j].variable_name === variables[i]){
                    is_created = true
                    graph.Variables[j].associate_functions.push(f_c)
                    parser.evaluate(graph.Variables[j].variable_name+'='+graph.Variables[j].current_value)
                    break}
            }
            if(is_created){
            }else{
                let v = create_function_images.create_variable(variables[i])
                v.associate_functions.push(f_c)
                parser.evaluate(v.variable_name+'='+v.current_value)
            }
        }

        while(x <= high){

            parser.evaluate('x='+x.toString())
            y = parser.evaluate(expression)
            y_array.push(y)
            obj = trans_coord.GTL(x,y)

            coords.push({
                x:obj.lx,
                y:obj.ly
            })

            x += interval
            x = parseFloat(x.toFixed(2))
        }

        let str = 'M'+coords[0].x.toString()+' '+coords[0].y.toString()

        this.path_lines = {
            xl:[],
            yl:[],
            xr:[],
            yr:[],
        }
        this.path_lines.xl.push(coords[0].x)
        this.path_lines.yl.push(coords[0].y)
        for(let i = 1; i < coords.length; ++i){
            if(Math.abs(y_array[i] - y_array[i-1]) > x_info.threshold){
                str += 'M' + coords[i].x.toString() + ' ' + coords[i].y.toString()
                this.path_lines.xl.splice(this.path_lines.xl.length-1,1)
                this.path_lines.yl.splice(this.path_lines.yl.length-1,1)
                this.path_lines.xl.push(coords[i].x)
                this.path_lines.yl.push(coords[i].y)
                continue;
            }
            str += ' L' + coords[i].x.toString() + ' ' + coords[i].y.toString()
            this.path_lines.xr.push(coords[i].x)
            this.path_lines.yr.push(coords[i].y)
            this.path_lines.xl.push(coords[i].x)
            this.path_lines.yl.push(coords[i].y)
        }
        this.path_lines.xl.splice(this.path_lines.xl.length-1,1)
        this.path_lines.yl.splice(this.path_lines.yl.length-1,1)

        let path = this.path
        path.setAttribute('d',str)
        path.setAttribute('stroke','blue')

        for(let i in this.Attached_Points){
            this.Attached_Points[i].ReCalculate_chosen(this.Attached_Points[i].P.cx.baseVal.value,0)
        }

        console.log(graph)
        methods.select_button_chosen()
    }
    show_function_window(){
        let window = document.createElement('div')
        let win = document.createElement('div')
        let title = document.createElement('div')
        let inputs_form = document.createElement('div')
        let title_div = document.createElement('div')
        let exps_div = document.createElement('div')
        let exps_title = document.createElement('div')
        let exps_input = document.createElement('input')
        let e_title_variable = document.createElement('div')
        let e_title_minimum = document.createElement('div')
        let e_title_maximum = document.createElement('div')
        let e_title_increment = document.createElement('div')
        let e_title_cv = document.createElement('div')
        let input_div = document.createElement('div')
        let common_input_variable = document.createElement('div')
        let common_input_minimum = document.createElement('div')
        let common_input_maximum = document.createElement('div')
        let common_input_increment = document.createElement('div')
        let common_input_cv = document.createElement('div')
        let input_variable = document.createElement('input')
        let input_minimum = document.createElement('input')
        let input_maximum = document.createElement('input')
        let input_increment = document.createElement('input')
        let input_cv = document.createElement('input')
        let confirm_button_div = document.createElement('div')
        let cb_div = document.createElement('div')

        window.classList.value = 'window'
        win.classList.value = 'win'
        title.classList.value = 'title'
        inputs_form.classList.value = 'inputs-form'
        exps_div.classList.value = 'exps-div'
        exps_title.classList.value = 'title-div'
        exps_title.style.setProperty('float', 'left')
        exps_title.style.setProperty('font-size', '14px')
        exps_input.classList.value = 'exps-input'
        title_div.classList.value = 'title-div'
        e_title_variable.classList.value = 'e-title'
        e_title_minimum.classList.value = 'e-title'
        e_title_maximum.classList.value = 'e-title'
        e_title_increment.classList.value = 'e-title'
        e_title_cv.classList.value = 'e-title'
        input_div.classList.value = 'input-div'
        common_input_variable.classList.value = 'common-input'
        common_input_minimum.classList.value = 'common-input'
        common_input_maximum.classList.value = 'common-input'
        common_input_increment.classList.value = 'common-input'
        common_input_cv.classList.value = 'common-input'
        input_variable.classList.value = 'input'
        input_minimum.classList.value = 'input'
        confirm_button_div.classList.value = 'confirm-button'
        cb_div.classList.value = 'cb'

        input_minimum.type = 'number'
        input_maximum.classList.value = 'input'
        input_maximum.type = 'number'
        input_increment.classList.value = 'input'
        input_increment.type = 'number'
        input_cv.classList.value = 'input'
        input_cv.type = 'number'

        exps_input.value = this.expression
        input_variable.value = 'x'
        input_variable.readOnly = true
        input_minimum.value = this.x_info.low
        input_maximum.value = this.x_info.high
        input_increment.value = this.x_info.sample_num
        input_cv.value = this.x_info.threshold

        title.appendChild(document.createTextNode('Function Window'))
        exps_title.appendChild(document.createTextNode('Function: y = '))
        e_title_variable.appendChild(document.createTextNode('Variable'))
        e_title_minimum.appendChild(document.createTextNode('Minimum'))
        e_title_maximum.appendChild(document.createTextNode('Maximum'))
        e_title_increment.appendChild(document.createTextNode('Samples'))
        e_title_cv.appendChild(document.createTextNode('Threshold'))
        cb_div.appendChild(document.createTextNode('Confirm'))

        confirm_button_div.appendChild(cb_div)

        common_input_variable.appendChild(input_variable)
        common_input_minimum.appendChild(input_minimum)
        common_input_maximum.appendChild(input_maximum)
        common_input_increment.appendChild(input_increment)
        common_input_cv.appendChild(input_cv)

        input_div.appendChild(common_input_variable)
        input_div.appendChild(common_input_minimum)
        input_div.appendChild(common_input_maximum)
        input_div.appendChild(common_input_increment)
        input_div.appendChild(common_input_cv)

        exps_div.appendChild(exps_title)
        exps_div.appendChild(exps_input)

        title_div.appendChild(e_title_variable)
        title_div.appendChild(e_title_minimum)
        title_div.appendChild(e_title_maximum)
        title_div.appendChild(e_title_increment)
        title_div.appendChild(e_title_cv)

        inputs_form.appendChild(exps_div)
        inputs_form.appendChild(title_div)
        inputs_form.appendChild(input_div)

        win.appendChild(title)

        window.appendChild(win)
        window.appendChild(inputs_form)
        window.appendChild(confirm_button_div)

        let editor = document.getElementById('editor')
        editor.appendChild(window)

        let f_c = this

        cb_div.onclick = function (){
            let expression = exps_input.value
            let x_info = {
                low: parseFloat(input_minimum.value),
                high: parseFloat(input_maximum.value),
                sample_num: parseFloat(input_increment.value),
                threshold: parseFloat(input_cv.value)
            }

            f_c.expression = expression
            f_c.x_info = x_info

            f_c.ReCalculate_function_changed(expression, x_info)
            editor.removeChild(window)
        }
    }
    Delete(){
        for(let i in this.Attached_Points){
            this.Attached_Points[i].Delete()
        }
        let g = this.path.parentNode
        svg.removeChild(g)
        for(let i in graph.Curves){
            if(this === graph.Curves[i]){graph.Curves.splice(i, 1)}
        }
        for(let i in graph.elements){
            if(this.path === graph.elements[i]){graph.elements.splice(i, 1)}
        }
        obj_list.removeChild(this.div_obj)

    }
}
class Graph_list{
    Points = []
    Lines = []
    Circles = []
    Curves = []
    Variables = []
    elements = []
    add_point = function (p){
        this.Points.push(p)
    }
    add_line = function (l){
        this.Lines.push(l)
    }
    add_circle = function (c){
        this.Circles.push(c)
    }
    add_function_curve = function (f_c){
        this.Curves.push(f_c)
    }
    add_variable = function (v){
        this.Variables.push(v)
    }
}
graph = new Graph_list()

class trans_coord{
    static scale_trans(x, y){
        return {
            newx:x/svg.currentScale + svg.viewBox.baseVal.x,
            newy:y/svg.currentScale + svg.viewBox.baseVal.y
        }
    }

    static LTG(lx, ly){
        return{
            gx:(lx - 683)/50,
            gy:(384 - ly)/50
        }
    }

    static GTL(gx, gy){
        return{
            lx:gx*50+683,
            ly:-gy*50+384
        }
    }
}

class create_elements{
    static create_point = function (x, y, id, color="black"){
        let point = document.createElementNS('http://www.w3.org/2000/svg','circle');

        point.setAttribute('cx', x);
        point.setAttribute('cy', y);
        point.r.baseVal.value = point_r;
        point.setAttribute('stroke', color);
        point.setAttribute('fill', color)
        point.setAttribute('class', 'point')
        id.appendChild(point)
        return point
    }

    static create_line = function (x1,x2,y1,y2,id,color="black"){
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', x1)
        line.setAttribute('x2', x2)
        line.setAttribute('y1', y1)
        line.setAttribute('y2', y2)
        line.setAttribute('stroke', color);
        line.setAttribute('class','line')
        id.appendChild(line)
        return line
    }

    static create_circle = function(x,y,id,color='black'){
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', 0)
        circle.setAttribute('stroke', color);
        circle.setAttribute('class', 'circle');
        id.appendChild(circle)
        return circle
    }

    static create_text = function (x,y,id,color='black',content=""){
        let text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

        text.setAttribute('x',x)
        text.setAttribute('y',y)
        text.setAttribute('fill',color)
        id.appendChild(text)

        text.textContent = content
        return text
    }
}

class create_function_images{
    static new_variable(){
        let window = document.createElement('div')
        let win = document.createElement('div')
        let title = document.createElement('div')
        let inputs_form = document.createElement('div')
        let title_div = document.createElement('div')
        let e_title_variable = document.createElement('div')
        let e_title_minimum = document.createElement('div')
        let e_title_maximum = document.createElement('div')
        let e_title_increment = document.createElement('div')
        let e_title_cv = document.createElement('div')
        let input_div = document.createElement('div')
        let common_input_variable = document.createElement('div')
        let common_input_minimum = document.createElement('div')
        let common_input_maximum = document.createElement('div')
        let common_input_increment = document.createElement('div')
        let common_input_cv = document.createElement('div')
        let input_variable = document.createElement('input')
        let input_minimum = document.createElement('input')
        let input_maximum = document.createElement('input')
        let input_increment = document.createElement('input')
        let input_cv = document.createElement('input')
        let confirm_button_div = document.createElement('div')
        let cb_div = document.createElement('div')

        window.classList.value = 'window'
        win.classList.value = 'win'
        title.classList.value = 'title'
        inputs_form.classList.value = 'inputs-form'
        title_div.classList.value = 'title-div'
        e_title_variable.classList.value = 'e-title'
        e_title_minimum.classList.value = 'e-title'
        e_title_maximum.classList.value = 'e-title'
        e_title_increment.classList.value = 'e-title'
        e_title_cv.classList.value = 'e-title'
        input_div.classList.value = 'input-div'
        common_input_variable.classList.value = 'common-input'
        common_input_minimum.classList.value = 'common-input'
        common_input_maximum.classList.value = 'common-input'
        common_input_increment.classList.value = 'common-input'
        common_input_cv.classList.value = 'common-input'
        input_variable.classList.value = 'input'
        input_minimum.classList.value = 'input'
        confirm_button_div.classList.value = 'confirm-button'
        cb_div.classList.value = 'cb'

        input_minimum.type = 'number'
        input_maximum.classList.value = 'input'
        input_maximum.type = 'number'
        input_increment.classList.value = 'input'
        input_increment.type = 'number'
        input_cv.classList.value = 'input'
        input_cv.type = 'number'

        title.appendChild(document.createTextNode('Variable Window'))
        e_title_variable.appendChild(document.createTextNode('Variable'))
        e_title_minimum.appendChild(document.createTextNode('Minimum'))
        e_title_maximum.appendChild(document.createTextNode('Maximum'))
        e_title_increment.appendChild(document.createTextNode('Increment'))
        e_title_cv.appendChild(document.createTextNode('Current Value'))
        cb_div.appendChild(document.createTextNode('Confirm'))

        confirm_button_div.appendChild(cb_div)

        common_input_variable.appendChild(input_variable)
        common_input_minimum.appendChild(input_minimum)
        common_input_maximum.appendChild(input_maximum)
        common_input_increment.appendChild(input_increment)
        common_input_cv.appendChild(input_cv)

        input_div.appendChild(common_input_variable)
        input_div.appendChild(common_input_minimum)
        input_div.appendChild(common_input_maximum)
        input_div.appendChild(common_input_increment)
        input_div.appendChild(common_input_cv)

        title_div.appendChild(e_title_variable)
        title_div.appendChild(e_title_minimum)
        title_div.appendChild(e_title_maximum)
        title_div.appendChild(e_title_increment)
        title_div.appendChild(e_title_cv)

        inputs_form.appendChild(title_div)
        inputs_form.appendChild(input_div)

        win.appendChild(title)

        window.appendChild(win)
        window.appendChild(inputs_form)
        window.appendChild(confirm_button_div)

        let editor = document.getElementById('editor')
        editor.appendChild(window)

        cb_div.onclick = function (){
            create_function_images.create_variable(input_variable.value, {low:parseFloat(input_minimum.value), high:parseFloat(input_maximum.value)}, parseFloat(input_increment.value), parseFloat(input_cv.value))
            editor.removeChild(window)
        }
    }
    static new_animation(){
        let window = document.createElement('div')
        let win = document.createElement('div')
        let title = document.createElement('div')
        let inputs_form = document.createElement('div')
        let title_div = document.createElement('div')
        let e_title_variable = document.createElement('div')
        let e_title_minimum = document.createElement('div')
        let e_title_maximum = document.createElement('div')
        let e_title_increment = document.createElement('div')
        let e_title_cv = document.createElement('div')
        let input_div = document.createElement('div')
        let common_input_variable = document.createElement('div')
        let common_input_minimum = document.createElement('div')
        let common_input_maximum = document.createElement('div')
        let common_input_increment = document.createElement('div')
        let common_input_cv = document.createElement('div')
        let input_variable = document.createElement('input')
        let input_minimum = document.createElement('input')
        let input_maximum = document.createElement('input')
        let input_increment = document.createElement('input')
        let input_cv = document.createElement('input')
        let confirm_button_div = document.createElement('div')
        let cb_div = document.createElement('div')

        window.classList.value = 'window'
        win.classList.value = 'win'
        title.classList.value = 'title'
        inputs_form.classList.value = 'inputs-form'
        title_div.classList.value = 'title-div'
        e_title_variable.classList.value = 'e-title'
        e_title_minimum.classList.value = 'e-title'
        e_title_maximum.classList.value = 'e-title'
        e_title_increment.classList.value = 'e-title'
        e_title_cv.classList.value = 'e-title'
        input_div.classList.value = 'input-div'
        common_input_variable.classList.value = 'common-input'
        common_input_minimum.classList.value = 'common-input'
        common_input_maximum.classList.value = 'common-input'
        common_input_increment.classList.value = 'common-input'
        common_input_cv.classList.value = 'common-input'
        input_variable.classList.value = 'input'
        input_minimum.classList.value = 'input'
        confirm_button_div.classList.value = 'confirm-button'
        cb_div.classList.value = 'cb'

        input_minimum.type = 'number'
        input_maximum.classList.value = 'input'
        input_maximum.type = 'number'
        input_increment.classList.value = 'input'
        input_increment.type = 'number'
        input_cv.classList.value = 'input'
        input_cv.type = 'number'

        title.appendChild(document.createTextNode('Animation Window'))
        e_title_variable.appendChild(document.createTextNode('Variable'))
        e_title_minimum.appendChild(document.createTextNode('Minimum'))
        e_title_maximum.appendChild(document.createTextNode('Maximum'))
        e_title_increment.appendChild(document.createTextNode('Step'))
        e_title_cv.appendChild(document.createTextNode('Interval'))
        cb_div.appendChild(document.createTextNode('Confirm'))

        input_minimum.value = 0
        input_maximum.value = 1
        input_increment.value = 100
        input_cv.value = 50

        confirm_button_div.appendChild(cb_div)

        common_input_variable.appendChild(input_variable)
        common_input_minimum.appendChild(input_minimum)
        common_input_maximum.appendChild(input_maximum)
        common_input_increment.appendChild(input_increment)
        common_input_cv.appendChild(input_cv)

        input_div.appendChild(common_input_variable)
        input_div.appendChild(common_input_minimum)
        input_div.appendChild(common_input_maximum)
        input_div.appendChild(common_input_increment)
        input_div.appendChild(common_input_cv)

        title_div.appendChild(e_title_variable)
        title_div.appendChild(e_title_minimum)
        title_div.appendChild(e_title_maximum)
        title_div.appendChild(e_title_increment)
        title_div.appendChild(e_title_cv)

        inputs_form.appendChild(title_div)
        inputs_form.appendChild(input_div)

        win.appendChild(title)

        window.appendChild(win)
        window.appendChild(inputs_form)
        window.appendChild(confirm_button_div)

        let editor = document.getElementById('editor')
        editor.appendChild(window)

        cb_div.onclick = function (){
            create_function_images.create_animation(input_variable.value, {low:parseFloat(input_minimum.value), high:parseFloat(input_maximum.value)}, parseFloat(input_increment.value), parseFloat(input_cv.value))
            editor.removeChild(window)
        }
    }
    static create_variable(variable_name, range={low:0,high:10}, increment=1, current_value=5){
        let v = new Variable(variable_name, range, increment, current_value)

        let preview = document.getElementById('preview')

        let main_div = document.createElement('div')
        main_div.classList.value = 'variable'
        let div_ruler = document.createElement('div')
        div_ruler.classList.value = 'variable_ruler'

        let div_variable_name = document.createElement('div')
        div_variable_name.classList.value = 'variable_name'
        let txt = document.createTextNode(variable_name+'=')
        div_variable_name.appendChild(txt)

        let variable_input = document.createElement('input')
        variable_input.classList.value = 'variable_input'
        variable_input.id = 'variable_input_' + variable_name
        variable_input.type = 'text'
        variable_input.value = current_value


        let variable_slider = document.createElement('div')
        variable_slider.classList.value = 'variable_slider'
        variable_slider.id = 'variable_slider_' + variable_name

        console.log(variable_slider)
        div_ruler.appendChild(div_variable_name)
        div_ruler.appendChild(variable_input)
        div_ruler.appendChild(variable_slider)
        main_div.appendChild(div_ruler)
        preview.appendChild(main_div)

        v.assist_div = main_div
        v.assist_div.id = v.assist_div_id
        graph.add_variable(v)
        graph.elements.push(main_div)

        $(function () {
            $("#variable_slider_" + variable_name).slider({
                value: v.current_value,
                min: v.range.low,
                max: v.range.high,
                step: increment,
                slide: function(event, ui) {
                    variable_input.value = ui.value
                    v.current_value = ui.value
                    v.ReCalculate_variable_changed()
                }
            });
        });
        console.log($("#variable_slider_" + variable_name).slider())
        variable_input.onkeydown = function (event){
            if(event.keyCode === 13){
                if(variable_input.value > v.range.high){
                    v.current_value = v.range.high
                    variable_input.value = v.current_value
                }
                else if(variable_input.value < v.range.low){
                    v.current_value = v.range.low
                    variable_input.value = v.current_value
                }
                else{v.current_value = variable_input.value}
                $( "#variable_slider_" + variable_name).slider({value: v.current_value})
                v.ReCalculate_variable_changed()
            }
        }

        v.assist_div.ondblclick = function (event){
            v.show_variable_window()
        }
        return v
    }
    static create_function(){
        const parser = math.parser()
        let expression = document.getElementById('function_input').value
        console.log(expression)
        let low = -5
        let high = 5
        let sample_num = 200
        let threshold = 10
        let x = low
        let y = 0
        let obj = {}
        let interval = (high - low)/sample_num
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        let f_c = new FunctionCurve()
        f_c.expression = expression
        f_c.x_info.low = low
        f_c.x_info.high = high
        f_c.x_info.sample_num = sample_num
        f_c.x_info.threshold = threshold
        let coords = []
        let y_array = []

        svg_curves.appendChild(g)

        graph.add_function_curve(f_c)

        const node = math.parse(expression)
        const filtered_symbol_nodes = node.filter(function (node) {
            return node.isSymbolNode
        })
        console.log(filtered_symbol_nodes)
        const filtered_function_nodes = node.filter(function (node) {
            return node.isFunctionNode
        })
        console.log(filtered_function_nodes)

        let variables = []
        for(let i in filtered_symbol_nodes){
            let is_function = false
            for(let j in filtered_function_nodes){
                if(filtered_symbol_nodes[i].name === filtered_function_nodes[j].fn.name){is_function=true;break}
            }
            if(is_function){}else{
                let is_listed = false
                for(let k in variables){
                    if(variables[k] === filtered_symbol_nodes[i].name){is_listed=true;break}
                }
                if(is_listed){}else{variables.push(filtered_symbol_nodes[i].name)}
            }
        }
        for(let i in variables){if(variables[i] === 'x'){variables.splice(i,1);break}}
        console.log(variables)
        f_c.associate_variables = variables
        for(let i in variables){
            let is_created = false
            for(let j in graph.Variables){
                if(graph.Variables[j].variable_name === variables[i]){
                    is_created = true
                    graph.Variables[j].associate_functions.push(f_c)
                    parser.evaluate(graph.Variables[j].variable_name+'='+graph.Variables[j].current_value)
                    break}
            }
            if(is_created){
            }else{
                let v = create_function_images.create_variable(variables[i])
                v.associate_functions.push(f_c)
                parser.evaluate(v.variable_name+'='+v.current_value)
            }
        }

        while(x <= high){

            parser.evaluate('x='+x.toString())
            y = parser.evaluate(expression)
            y_array.push(y)
            obj = trans_coord.GTL(x,y)

            coords.push({
                x:obj.lx,
                y:obj.ly
            })

            x += interval
            x = parseFloat(x.toFixed(2))
        }

        let str = 'M'+coords[0].x.toString()+' '+coords[0].y.toString()

        f_c.path_lines.xl.push(coords[0].x)
        f_c.path_lines.yl.push(coords[0].y)
        for(let i = 1; i < coords.length; ++i){
            if(Math.abs(y_array[i] - y_array[i-1]) > threshold){
                str += 'M' + coords[i].x.toString() + ' ' + coords[i].y.toString()
                f_c.path_lines.xl.splice(f_c.path_lines.xl.length-1,1)
                f_c.path_lines.yl.splice(f_c.path_lines.yl.length-1,1)
                f_c.path_lines.xl.push(coords[i].x)
                f_c.path_lines.yl.push(coords[i].y)
                continue;
            }
            str += ' L' + coords[i].x.toString() + ' ' + coords[i].y.toString()
            f_c.path_lines.xr.push(coords[i].x)
            f_c.path_lines.yr.push(coords[i].y)
            f_c.path_lines.xl.push(coords[i].x)
            f_c.path_lines.yl.push(coords[i].y)
        }
        f_c.path_lines.xl.splice(f_c.path_lines.xl.length-1,1)
        f_c.path_lines.yl.splice(f_c.path_lines.yl.length-1,1)

        let path = document.createElementNS('http://www.w3.org/2000/svg','path')
        g.appendChild(path)
        graph.elements.push(path)
        f_c.path = path
        path.setAttribute('d',str)
        path.setAttribute('stroke','blue')

        console.log(graph)
        methods.select_button_chosen()
    }
    static create_animation(variable_name, range={low:0,high:1}, step=100, interval=50){
        let a = new Animation(variable_name, range, step, interval)


    }

}

class methods{
    static get_track_status(object){
        let track_cb = object.tracks_checkbox

        return track_cb.checked
    }
    static clear_graph(){
        selected_points = []
        selected_lines = []
        selected_circles = []
        selected_curves = []
        selected_variables = []
        for(let i in graph.Points){
            if(graph.Points[i].chosen){
                graph.Points[i].chosen = false
                graph.Points[i].P.setAttribute('fill','red')
                graph.Points[i].div_obj.style.backgroundColor = 'white'
            }
        }
        for(let i in graph.Lines){
            if(graph.Lines[i].chosen){
                graph.Lines[i].chosen = false
                graph.Lines[i].L.setAttribute('stroke','blue')
                graph.Lines[i].div_obj.style.backgroundColor = 'white'
            }
        }
        for(let i in graph.Circles){
            if(graph.Circles[i].chosen){
                graph.Circles[i].chosen = false
                graph.Circles[i].C.setAttribute('stroke','blue')
                graph.Circles[i].div_obj.style.backgroundColor = 'white'
            }
        }
        for(let i in graph.Curves){
            if(graph.Curves[i].chosen){
                graph.Curves[i].chosen = false
                graph.Curves[i].path.setAttribute('stroke','blue')
                graph.Curves[i].div_obj.style.backgroundColor = 'white'
            }
        }
        for(let i in graph.Variables){
            if(graph.Variables[i].chosen){
                graph.Variables[i].chosen = false
                graph.Variables[i].div_obj.setAttribute('box-shadow', 'rgb(255, 0, 255) 0px 0px 5px')
                graph.Curves[i].div_obj.style.backgroundColor = 'white'
            }
        }
        for (let i = 0; i < graph.elements.length; i++) {
            graph.elements[i].onclick = function () {}
            graph.elements[i].onmouseover = function (){this.style.cursor = 'default'}
            graph.elements[i].onmouseout = function (){}
        }
    }
    static clear_property_window(){
        while (property_window.firstChild) {
            property_window.removeChild(property_window.firstChild);
        }
    }
    static is_mouse_on(x, y){
        let v = []
        for (let i in graph.Lines){
            if(graph.Lines[i].is_mouse_on(x,y)){
                v.push({
                    on:'Line',
                    object:graph.Lines[i]
                })
            }
        }

        for (let i in graph.Circles){
            if(graph.Circles[i].is_mouse_on(x,y)){
                v.push({
                    on:'Circle',
                    object:graph.Circles[i]
                })
            }
        }

        for (let i in graph.Curves){
            console.log(111)
            if(graph.Curves[i].is_mouse_on(x,y)){
                v.push({
                    on:'Curve',
                    object:graph.Curves[i]
                })
            }
        }

        if(v.length === 0){
            return{
                mouse_on: false,
                on:'None',
                object: undefined
            }
        }else if(v.length === 1){
            return{
                mouse_on: true,
                on:v[0].on,
                object:v[0].object
            }
        }else{
            return{
                mouse_on: true,
                on:'Intersection',
                object: [v[0].object, v[1].object]
            }
        }

    }
    static select_button_chosen = function(){
        svg.style.cursor = 'default'
        console.log(graph)

        let mouse_over = false
        let select_flag = false
        let moved = false
        for (let i = 0; i < graph.elements.length; i++) {
            graph.elements[i].onclick = function (event) {
                for(let j in graph.Points){
                    if(graph.Points[j].P === this){
                        if(moved && graph.Points[j].chosen){moved = false;return;}
                        else{
                            graph.Points[j].chosen_switch()
                            moved = false
                        }
                    }
                }
                for(let j in graph.Lines){
                    if(graph.Lines[j].L === this){
                        if(moved && graph.Lines[j].chosen){moved = false;return;}
                        else{
                            graph.Lines[j].chosen_switch()
                            moved = false
                        }
                    }
                }
                for(let j in graph.Circles){
                    if(graph.Circles[j].C === this){
                        if(moved && graph.Circles[j].chosen){moved = false;return;}
                        else{
                            graph.Circles[j].chosen_switch()
                            moved = false
                        }
                    }
                }
                for(let j in graph.Curves){
                    if(graph.Curves[j].path === this){
                        if(moved && graph.Curves[j].chosen){moved = false;return;}
                        else{
                            graph.Curves[j].chosen_switch()
                            moved = false
                        }
                    }
                }
                /*
                for(let j in graph.Variables){
                    if(graph.Variables[j].assist_div === this){
                        if(moved && graph.Variables[j].chosen){moved = false;return;}
                        else{
                            graph.Variables[j].chosen_switch()
                            moved = false
                        }
                    }
                }*/
                console.log(selected_points)
                console.log(selected_lines)
                console.log(selected_circles)
                console.log(selected_curves)
                console.log(selected_variables)
            }

            graph.elements[i].onmouseover = function (){
                this.style.cursor = 'hand'
                mouse_over = true
            }
            graph.elements[i].onmouseout = function (){
                mouse_over = false
            }
        }
        var x1=0,y1=0,x2=0,y2=0
        var drag_flag = false
        var start_bias_x=svg.viewBox.baseVal.x
        var start_bias_y=svg.viewBox.baseVal.y
        svg.onclick = function (event){
        }
        svg.onmousedown = function(event){
            if(event.button === 0){
                console.log(event)
                if(mouse_over){
                    x1 = event.offsetX
                    y1 = event.offsetY
                    x2 = x1
                    y2 = y1
                    select_flag = true
                }
            }
            if(event.button === 2) {
                start_bias_x=svg.viewBox.baseVal.x
                start_bias_y=svg.viewBox.baseVal.y
                x1 = event.offsetX
                y1 = event.offsetY
                x2 = x1
                y2 = y1
                drag_flag = true
            }
        }
        svg.onmousemove = function (event){
            if(select_flag){
                x2 = event.offsetX
                y2 = event.offsetY

                bias_x = (x2 - x1)/svg.currentScale
                bias_y = (y2 - y1)/svg.currentScale

                for(let i in selected_points){
                    selected_points[i].P.ReCalculate_chosen(selected_points[i].x+bias_x,selected_points[i].y+bias_y)
                }
                for(let i in selected_lines){
                    selected_lines[i].L.ReCalculate_chosen(selected_lines[i].x1+bias_x,selected_lines[i].y1+bias_y,selected_lines[i].x2+bias_x,selected_lines[i].y2+bias_y)
                }
                for(let i in selected_circles){
                    selected_circles[i].C.ReCalculate_chosen(selected_circles[i].x+bias_x,selected_circles[i].y+bias_y,selected_circles[i].r2b_bias_x,selected_circles[i].r2b_bias_y)
                }
                for(let i in selected_variables){
                    selected_variables[i].variable.ReCalculate_chosen(selected_variables[i].x+(x2-x1),selected_variables[i].y+(y2-y1))
                }


            }
            if(drag_flag){
                x2 = event.offsetX
                y2 = event.offsetY
                bias_x = (x1 - x2) / svg.currentScale
                bias_y = (y1 - y2) / svg.currentScale
                svg.viewBox.baseVal.x = start_bias_x + bias_x
                svg.viewBox.baseVal.y = start_bias_y + bias_y
            }
        }
        svg.onmouseup = function (event){
            console.log(graph)
            if(select_flag){
                x2 = event.offsetX
                y2 = event.offsetY
                bias_x = (x2 - x1)/svg.currentScale
                bias_y = (y2 - y1)/svg.currentScale

                for(let i in selected_points){
                    selected_points[i].P.ReCalculate_chosen(selected_points[i].x+bias_x,selected_points[i].y+bias_y)
                    selected_points[i].x = selected_points[i].P.P.cx.baseVal.value
                    selected_points[i].y = selected_points[i].P.P.cy.baseVal.value
                }
                for(let i in selected_lines){
                    selected_lines[i].L.ReCalculate_chosen(selected_lines[i].x1+bias_x,selected_lines[i].y1+bias_y,selected_lines[i].x2+bias_x,selected_lines[i].y2+bias_y)
                    selected_lines[i].x1 = selected_lines[i].L.L.x1.baseVal.value
                    selected_lines[i].y1 = selected_lines[i].L.L.y1.baseVal.value
                    selected_lines[i].x2 = selected_lines[i].L.L.x2.baseVal.value
                    selected_lines[i].y2 = selected_lines[i].L.L.y2.baseVal.value
                }
                for(let i in selected_circles){
                    selected_circles[i].C.ReCalculate_chosen(selected_circles[i].x+bias_x,selected_circles[i].y+bias_y,selected_circles[i].r2b_bias_x,selected_circles[i].r2b_bias_y)
                    selected_circles[i].x = selected_circles[i].C.C.cx.baseVal.value
                    selected_circles[i].y = selected_circles[i].C.C.cy.baseVal.value
                }
                for(let i in selected_variables){
                    selected_variables[i].variable.ReCalculate_chosen(selected_variables[i].x+(x2-x1),selected_variables[i].y+(y2-y1))
                    selected_variables[i].x = $('#'+selected_variables[i].variable.assist_div_id).position().left-$('#'+selected_variables[i].variable.assist_div_id).parent().position().left

                    selected_variables[i].y = $('#'+selected_variables[i].variable.assist_div_id).position().top-$('#'+selected_variables[i].variable.assist_div_id).parent().position().top
                    console.log(1)
                }


                if(Math.abs(bias_x) > 0 || Math.abs(bias_y) > 0){moved = true}
                console.log(moved)
                select_flag = false
            }
            if(drag_flag) {
                bias_x = (x1 - x2) / svg.currentScale
                bias_y = (y1 - y2) / svg.currentScale
                svg.viewBox.baseVal.x = start_bias_x + bias_x
                svg.viewBox.baseVal.y = start_bias_y + bias_y

                drag_flag = false
            }
        }
        /*
        for(let i in graph.Variables){
            graph.Variables[i].assist_div.onmousedown = svg.onmousedown
            graph.Variables[i].assist_div.onmousemove = svg.onmousemove
            graph.Variables[i].assist_div.onmouseup = svg.onmouseup
        }
         */
    }

    static point_button_chosen = function(){
        this.clear_graph()
        svg.style.cursor = 'crosshair'
        var x1,y1;
        var obj
        let p,pp
        svg.onmousedown=function(event){
            if(event.button === 2){methods.select_button_chosen();return}
            x1 = event.offsetX;
            y1 = event.offsetY;
            obj = trans_coord.scale_trans(x1, y1)
            x1 = obj.newx
            y1 = obj.newy

            for(let i in graph.Points){
                if(Math.abs(graph.Points[i].P.cx.baseVal.value - x1)<=point_r && Math.abs(graph.Points[i].P.cy.baseVal.value - y1)<=point_r){
                    return
                }
            }
            let res = methods.is_mouse_on(x1,y1)
            if(res.mouse_on){
                console.log(res)
                pp = create_elements.create_point(x1, y1, svg_points,'red')
                p = new Point(pp)
                graph.add_point(p)
                graph.elements.push(pp)

                switch (res.on){
                    case 'Line':
                        p.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Line',
                                ratio: (x1-res.object.L.x1.baseVal.value)/(res.object.L.x2.baseVal.value-res.object.L.x1.baseVal.value),
                            }
                        })
                        res.object.Attached_Points.push(p)
                        console.log(p.Attached_to)
                        return
                    case 'Circle':
                        p.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Circle',
                                cos_value: (x1-res.object.C.cx.baseVal.value)/res.object.C.r.baseVal.value,
                                sin_value: -(y1-res.object.C.cy.baseVal.value)/res.object.C.r.baseVal.value,
                                r2b_bias_x: res.object.Pb.P.cx.baseVal.value - res.object.Pr.P.cx.baseVal.value,
                                r2b_bias_y: res.object.Pb.P.cy.baseVal.value - res.object.Pr.P.cy.baseVal.value
                            }
                        })
                        res.object.Attached_Points.push(p)
                        console.log(p.Attached_to)
                        return
                    case 'Curve':
                        p.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Curve',
                            }
                        })
                        res.object.Attached_Points.push(p)
                        console.log(p.Attached_to)
                        return
                    case 'Intersection':
                        p.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Intersection',
                            }
                        })
                        if(res.object[0].type === 'Line' && res.object[1].type === 'Line'){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Line_Line'}}
                        else if((res.object[0].type === 'Line' && res.object[1].type === 'Circle') || (res.object[1].type === 'Line' && res.object[0].type === 'Circle')){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Line_Circle'}}
                        else if((res.object[0].type === 'Line' && res.object[1].type === 'Curve') || (res.object[1].type === 'Line' && res.object[0].type === 'Curve')){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Line_Curve'}}
                        else if(res.object[0].type === 'Circle' && res.object[1].type === 'Circle'){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Circle_Circle'}}
                        else if((res.object[0].type === 'Circle' && res.object[1].type === 'Curve') || (res.object[1].type === 'Circle' && res.object[0].type === 'Curve')){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Circle_Curve'}}
                        else if(res.object[0].type === 'Curve' && res.object[1].type === 'Curve'){p.Attached_to[0].info = {type:'Intersection',itsc_type:'Curve_Curve'}}
                        res.object[0].Attached_Points.push(p)
                        res.object[1].Attached_Points.push(p)
                        console.log(p.Attached_to)
                        return
                }
            }
            p = create_elements.create_point(x1, y1, svg_points,'red')
            pp = new Point(p)
            graph.add_point(pp)
            graph.elements.push(p)

            console.log(graph)
        }
        svg.onmousemove=function (){}
        svg.onmouseup=function (){}
    }

    static line_button_chosen = function (){
        this.clear_graph()
        svg.style.cursor = 'crosshair'
        var x1,y1,x2,y2;
        var flag = true;
        var line;
        var obj
        let p1,p2,l
        let pp1,pp2
        svg.onmousedown=function (event){
            if(event.button === 2){methods.select_button_chosen();return}
            x1 = event.offsetX;
            y1 = event.offsetY;
            obj = trans_coord.scale_trans(x1, y1)
            x1 = obj.newx
            y1 = obj.newy
            x2 = x1;
            y2 = y1;
            for(let i in graph.Points){
                if(Math.abs(graph.Points[i].P.cx.baseVal.value - x1)<=point_r && Math.abs(graph.Points[i].P.cy.baseVal.value - y1)<=point_r){
                    p1 = graph.Points[i]
                    pp1 = graph.Points[i].P

                    x1 = graph.Points[i].P.cx.baseVal.value
                    y1 = graph.Points[i].P.cy.baseVal.value
                    x2 = x1
                    y2 = y1
                    line = create_elements.create_line(x1, x2, y1, y2, svg_others, 'blue')

                    flag = true
                    return
                }
            }

            let res = methods.is_mouse_on(x1,y1)
            if(res.mouse_on){
                pp1 = create_elements.create_point(x1, y1, svg_points,'red')
                p1 = new Point(pp1)
                graph.add_point(p1)
                graph.elements.push(pp1)
                line = create_elements.create_line(x1, x2, y1, y2, svg_others, 'blue')

                flag = true
                switch (res.on){
                    case 'Line':
                        p1.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Line',
                                ratio: (x1-res.object.L.x1.baseVal.value)/(res.object.L.x2.baseVal.value-res.object.L.x1.baseVal.value),
                            }
                        })
                        res.object.Attached_Points.push(p1)
                        console.log(p1.Attached_to)
                        return
                    case 'Circle':

                        p1.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Circle',
                                cos_value: (x1-res.object.C.cx.baseVal.value)/res.object.C.r.baseVal.value,
                                sin_value: -(y1-res.object.C.cy.baseVal.value)/res.object.C.r.baseVal.value,
                                r2b_bias_x: res.object.Pb.P.cx.baseVal.value - res.object.Pr.P.cx.baseVal.value,
                                r2b_bias_y: res.object.Pb.P.cy.baseVal.value - res.object.Pr.P.cy.baseVal.value
                            }
                        })
                        res.object.Attached_Points.push(p1)
                        console.log(p1.Attached_to)
                        return
                    case 'Curve':
                        p1.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Curve',
                            }
                        })
                        res.object.Attached_Points.push(p1)
                        console.log(p1.Attached_to)
                        return
                }
            }
            pp1 = create_elements.create_point(x1, y1, svg_points,'red')
            p1 = new Point(pp1)
            graph.add_point(p1)
            graph.elements.push(pp1)
            line = create_elements.create_line(x1, x2, y1, y2, svg_others, 'blue')

            flag = true

        }
        svg.onmousemove = function (event) {
            if(flag){
                if(!line){return}
                x2 = event.offsetX;
                y2 = event.offsetY;
                obj = trans_coord.scale_trans(x2, y2)
                x2 = obj.newx
                y2 = obj.newy
                line.setAttribute('x2', x2)
                line.setAttribute('y2', y2)
            }
        }
        svg.onmouseup = function (e) {
            line.setAttribute('x2', x2)
            line.setAttribute('y2', y2)

            flag=false;
            if(Math.abs(x1-x2) <= 8 && Math.abs(y1-y2) <= 2 * point_r){
                svg_others.removeChild(line)
                return
            }
            for(let i in graph.Points){
                if(Math.abs(graph.Points[i].P.cx.baseVal.value - x2)<=point_r && Math.abs(graph.Points[i].P.cy.baseVal.value - y2)<=point_r){
                    line.setAttribute('x2', graph.Points[i].P.cx.baseVal.value)
                    line.setAttribute('y2', graph.Points[i].P.cy.baseVal.value)
                    p2 = graph.Points[i]
                    pp2 = graph.Points[i].P
                    l = new Line(line, p1, p2)
                    graph.add_line(l)
                    p1.Basic_to.push(l)
                    p2.Basic_to.push(l)
                    graph.elements.push(line)
                    return
                }
            }

            let res = methods.is_mouse_on(x2, y2)
            if(res.mouse_on){
                pp2 = create_elements.create_point(x2, y2, svg_points,'red')
                p2 = new Point(pp2)
                graph.add_point(p2)
                l = new Line(line, p1, p2)
                graph.add_line(l)
                p1.Basic_to.push(l)
                p2.Basic_to.push(l)
                graph.elements.push(line)
                graph.elements.push(pp2)
                console.log(graph)
                switch (res.on){
                    case 'Line':
                        p2.Attached_to.push({
                            object:res.object,
                            info:{
                                type:'Line',
                                ratio: (x2-res.object.L.x1.baseVal.value)/(res.object.L.x2.baseVal.value-res.object.L.x1.baseVal.value),
                            }
                        })
                        res.object.Attached_Points.push(p2)
                        console.log(p2.Attached_to)
                        return
                    case 'Circle':
                        p2.Attached_to.push({
                            object:res.object,
                            info:{
                                type:'Circle',
                                cos_value:(x2-res.object.C.cx.baseVal.value)/res.object.C.r.baseVal.value,
                                sin_value:-(y2-res.object.C.cy.baseVal.value)/res.object.C.r.baseVal.value,
                                r2b_bias_x: res.object.Pb.P.cx.baseVal.value - res.object.Pr.P.cx.baseVal.value,
                                r2b_bias_y: res.object.Pb.P.cy.baseVal.value - res.object.Pr.P.cy.baseVal.value
                            }
                        })
                        res.object.Attached_Points.push(p2)
                        console.log(p2.Attached_to)
                        return
                    case 'Curve':
                        p2.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Curve',
                            }
                        })
                        res.object.Attached_Points.push(p2)
                        console.log(p2.Attached_to)
                        return
                }
            }
            pp2 = create_elements.create_point(x2, y2, svg_points,'red')
            p2 = new Point(pp2)
            graph.add_point(p2)
            l = new Line(line, p1, p2)
            graph.add_line(l)
            p1.Basic_to.push(l)
            p2.Basic_to.push(l)
            graph.elements.push(line)
            graph.elements.push(pp2)
            console.log(graph)
        }
    }

    static circle_button_chosen = function (){
        this.clear_graph()
        svg.style.cursor = 'crosshair'
        var x1,y1,x2,y2;
        var r = 0;
        var flag = true;
        var circle;
        var obj
        let pr,pb,c
        let ppr,ppb

        svg.onmousedown=function (event){
            r = 0
            if(event.button === 2){methods.select_button_chosen();return}
            x1 = event.offsetX;
            y1 = event.offsetY;
            obj = trans_coord.scale_trans(x1, y1)
            x1 = obj.newx
            y1 = obj.newy
            x2 = x1;
            y2 = y1;

            for(let i in graph.Points){
                if(Math.abs(graph.Points[i].P.cx.baseVal.value - x1)<=point_r && Math.abs(graph.Points[i].P.cy.baseVal.value - y1)<=point_r){
                    pr = graph.Points[i]
                    ppr = graph.Points[i].P

                    x1 = graph.Points[i].P.cx.baseVal.value
                    y1 = graph.Points[i].P.cy.baseVal.value
                    x2 = x1
                    y2 = y1
                    circle = create_elements.create_circle(x1, y1, svg_others, 'blue')

                    flag = true
                    return
                }
            }
            let res = methods.is_mouse_on(x1,y1)
            if(res.mouse_on){
                ppr = create_elements.create_point(x1, y1, svg_points,'red')
                pr = new Point(ppr)
                graph.add_point(pr)
                graph.elements.push(ppr)
                circle = create_elements.create_circle(x1,y1,svg_others,'blue')

                flag = true
                switch (res.on){
                    case 'Line':
                        pr.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Line',
                                ratio: (x1-res.object.L.x1.baseVal.value)/(res.object.L.x2.baseVal.value-res.object.L.x1.baseVal.value),
                            }
                        })
                        res.object.Attached_Points.push(pr)
                        console.log(pr.Attached_to)
                        return
                    case 'Circle':
                        pr.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Circle',
                                cos_value: (x1-res.object.C.cx.baseVal.value)/res.object.C.r.baseVal.value,
                                sin_value: -(y1-res.object.C.cy.baseVal.value)/res.object.C.r.baseVal.value,
                                r2b_bias_x: res.object.Pb.P.cx.baseVal.value - res.object.Pr.P.cx.baseVal.value,
                                r2b_bias_y: res.object.Pb.P.cy.baseVal.value - res.object.Pr.P.cy.baseVal.value
                            }
                        })
                        res.object.Attached_Points.push(pr)
                        console.log(pr.Attached_to)
                        return
                    case 'Curve':
                        pr.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Curve',
                            }
                        })
                        res.object.Attached_Points.push(pr)
                        console.log(pr.Attached_to)
                        return
                }
            }
            ppr = create_elements.create_point(x1, y1, svg_points,'red')
            pr = new Point(ppr)
            graph.add_point(pr)
            graph.elements.push(ppr)
            circle = create_elements.create_circle(x1,y1,svg_others,'blue')
            flag = true

        }
        svg.onmousemove = function (event) {
            if(flag){
                if(!circle){return}
                x2 = event.offsetX;
                y2 = event.offsetY;
                obj = trans_coord.scale_trans(x2, y2)
                x2 = obj.newx
                y2 = obj.newy
                r = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
                circle.setAttribute('r', r)
            }
        }
        svg.onmouseup = function (e) {
            circle.setAttribute('r', r)
            flag=false;
            if(circle.r.baseVal.value <= 2 * point_r){
                svg_others.removeChild(circle)
                return
            }
            for(let i in graph.Points){
                if(Math.abs(graph.Points[i].P.cx.baseVal.value - x2)<=point_r && Math.abs(graph.Points[i].P.cy.baseVal.value - y2)<=point_r){
                    x2 = graph.Points[i].P.cx.baseVal.value
                    y2 = graph.Points[i].P.cy.baseVal.value
                    r = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

                    circle.setAttribute('r', r)
                    pb = graph.Points[i]
                    ppb = graph.Points[i].P
                    c = new Circle(circle, pr, pb)
                    graph.add_circle(c)
                    graph.elements.push(circle)
                    pr.Basic_to.push(c)
                    pb.Basic_to.push(c)
                    return
                }
            }
            let res = methods.is_mouse_on(x2, y2)
            if(res.mouse_on){
                ppb = create_elements.create_point(x2, y2, svg_points,'red')
                pb = new Point(ppb)
                c = new Circle(circle, pr, pb)
                graph.add_circle(c)
                graph.elements.push(circle)
                graph.add_point(pb)
                graph.elements.push(ppb)
                pr.Basic_to.push(c)
                pb.Basic_to.push(c)
                console.log(graph)
                switch (res.on){
                    case 'Line':
                        pb.Attached_to.push({
                            object:res.object,
                            info:{
                                type:'Line',
                                ratio: (x2-res.object.L.x1.baseVal.value)/(res.object.L.x2.baseVal.value-res.object.L.x1.baseVal.value),
                            }
                        })
                        res.object.Attached_Points.push(pb)
                        console.log(pb.Attached_to)
                        return
                    case 'Circle':
                        pb.Attached_to.push({
                            object:res.object,
                            info:{
                                type:'Circle',
                                cos_value:(x2-res.object.C.cx.baseVal.value)/res.object.C.r.baseVal.value,
                                sin_value:-(y2-res.object.C.cy.baseVal.value)/res.object.C.r.baseVal.value,
                                r2b_bias_x: res.object.Pb.P.cx.baseVal.value - res.object.Pr.P.cx.baseVal.value,
                                r2b_bias_y: res.object.Pb.P.cy.baseVal.value - res.object.Pr.P.cy.baseVal.value
                            }
                        })
                        res.object.Attached_Points.push(pb)
                        console.log(pb.Attached_to)
                        return
                    case 'Curve':
                        pb.Attached_to.push({
                            object:res.object,
                            info:{
                                type: 'Curve',
                            }
                        })
                        res.object.Attached_Points.push(pb)
                        console.log(pb.Attached_to)
                        return
                }
            }
            ppb = create_elements.create_point(x2, y2, svg_points,'red')
            pb = new Point(ppb)
            c = new Circle(circle, pr, pb)
            graph.add_circle(c)
            graph.elements.push(circle)
            graph.add_point(pb)
            graph.elements.push(ppb)
            pr.Basic_to.push(c)
            pb.Basic_to.push(c)
            console.log(graph)
        }
    }

    static create_axis = function (){
        var axis = document.getElementById('axis')
        if(axis_on){
            let g = document.getElementById('axis_elements')
            axis.removeChild(g)
            axis_on = false
        }else{
            let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            g.setAttribute('id','axis_elements')
            axis.appendChild(g)
            //var axis_point = document.getElementById('axis_point')
            create_elements.create_line(683-2500, 683+2500, 384, 384, g)
            create_elements.create_line(683, 683, 384-2500, 384+2500, g)
            for (let i = 50; i > 0; --i){

                create_elements.create_point(683-i*50, 384, g)
                create_elements.create_point(683+i*50, 384, g)
                create_elements.create_point(683, 384-i*50, g)
                create_elements.create_point(683, 384+i*50, g)

                let text_x_1 = create_elements.create_text(683-i*50, 404, g, "black", (-i).toString())
                let text_x_2 = create_elements.create_text(683+i*50, 404, g, "black", i.toString())
                let text_y_1 = create_elements.create_text(693, 384-i*50, g, "black", i.toString())
                let text_y_2 = create_elements.create_text(693, 384+i*50, g, "black", (-i).toString())
                text_x_1.setAttribute('class','static_text')
                text_x_2.setAttribute('class','static_text')
                text_y_1.setAttribute('class','static_text')
                text_y_2.setAttribute('class','static_text')
            }
            axis_on = true
        }
    }

    static delete_objects = function (){
        let i = 0
        while(graph.Points.length > 0 && i<graph.Points.length){
            if(graph.Points[i].chosen){
                graph.Points[i].Delete()
                i = 0
                continue
            }
            ++i
        }
        i = 0
        while(graph.Lines.length > 0 && i<graph.Lines.length){
            if(graph.Lines[i].chosen){
                graph.Lines[i].Delete()
                i = 0
                continue
            }
            ++i
        }
        i = 0
        while(graph.Circles.length > 0 && i<graph.Circles.length){
            if(graph.Circles[i].chosen){
                graph.Circles[i].Delete()
                i = 0
                continue
            }
            ++i
        }
        i = 0
        while(graph.Curves.length > 0 && i<graph.Curves.length){
            if(graph.Curves[i].chosen){
                graph.Curves[i].Delete()
                i = 0
                continue
            }
            ++i
        }
        this.clear_graph()
        this.select_button_chosen()
    }
}

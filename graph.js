class Variable{
    constructor() {
        this.associateArray
    }
}
class Graph{

}
class Point extends Graph{
    Points = {
        x: [],
        y: [],
        number: [],
        Point_num: 0,
        chosen: []
    }
    add_point = function (a, b){
        this.Points.x.push(a)
        this.Points.y.push(b)
        this.Points.number.push(this.Points.Point_num)
        this.Points.Point_num += 1
    }
    get_num = function (X, Y){
        console.log(X, Y, this.Points)
        for(let i = 0; i < this.Points.Point_num; ++i){
            if(Math.abs(X - this.Points.x[i]) <= point_r && Math.abs(Y - this.Points.y[i]) <= point_r){
                return this.Points.number[i]
            }
        }
        return -1
    }
    ReCalculate(){}
}
class Line extends Graph{

}
class FunctionCurve extends Graph{
    ReCalculate(){}
}
let graphicY;
let listOfPoints = [];
let path, svg, dots;


function initPage() {
    addAxis();

    listOfPoints = loadFromStorage();
    if (!listOfPoints) {
        listOfPoints = [];
    }
    listOfPoints.map((point) => {
        if (point) {
            addPoint(point.timeStamp, point.y);
        }
    });
    rewriteAxes(listOfPoints);

    addListeners();
}

function addAxis() {
    let height = document.getElementsByClassName('graphic-panel')[0].clientHeight,
        width = document.getElementsByClassName('graphic-panel')[0].clientWidth,
        margin = 30;
    let yAxisLength = height - 2 * margin;

    svg = d3.select(".graphic-panel").append("svg")
        .attr("class", "axis")
        .attr("width", width)
        .attr("height", height);
    let scaleY = d3.scale.linear()
        .domain([100, -100])
        .range([0, yAxisLength]);
    let yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left");

    graphicY = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform",
            "translate(" + margin + "," + margin + ")")
        .call(yAxis);
    let line = d3.svg.line()
        .x(d => d.x)
        .y(d => d.y);
    path = svg.append("g").append("path")
        .attr("d", line([]))
        .style("stroke", "steelblue")
        .style("stroke-width", 2);
}

function redrawAxes() {
    // можно убрать clearInterval (оставить только setTimeout), но график будет выходить за границу блока
    // а потом перерисовываться
    setTimeout(clearInterval, 1350, setInterval(updateAxes, 150));
}

function updateAxes() {
    let height = document.getElementsByClassName('graphic-panel')[0].clientHeight,
        width = document.getElementsByClassName('graphic-panel')[0].clientWidth;
    svg.attr("height", height)
        .attr("width", width);
    rewriteAxes(listOfPoints);
}

function rewriteAxes(rawData, transitionDur = 0) {
    let height = document.getElementsByClassName('graphic-panel')[0].clientHeight,
        width = document.getElementsByClassName('graphic-panel')[0].clientWidth,
        margin = 30;
    let data = [];

    let minX = Number.MAX_VALUE, maxX = 0, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE;
    rawData.map(item => {
        if (item.timeStamp > maxX) {
            maxX = item.timeStamp
        }
        if (item.timeStamp < minX) {
            minX = item.timeStamp
        }
        if (item.y > maxY) {

            maxY = item.y
        }
        if (item.y < minY) {
            minY = item.y
        }
    });

    if (isEmpty(rawData)) {
        minX = -100;
        minY = -100;
        maxY = 100;
    }
    let xAxisLength = width - 2 * margin;
    let yAxisLength = height - 2 * margin;

    svg.attr("width", width)
        .attr("height", height);
    let rangeX = (maxX-minX)*0.05; // чтобы не был график до краев, нужно небольшое смещение
    let rangeY = (maxY-minY)*0.05; // по 5 процентов со всех краев
    let scaleX = d3.scale.linear()
        .domain([minX - rangeX, maxX + rangeX])
        .range([0, xAxisLength]);
    let scaleY = d3.scale.linear()
        .domain([maxY + rangeY, minY - rangeY])
        .range([0, yAxisLength]);
    for (let i = 0; i < rawData.length; i++)
        data.push({x: scaleX(rawData[i].timeStamp) + margin, y: scaleY(rawData[i].y) + margin})
    let yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left");

    graphicY
        .attr("transform",
            "translate(" + margin + "," + margin + ")")
        .call(yAxis);
    let line = d3.svg.line()
        .x(d => d.x)
        .y(d => d.y);
    path.transition(transitionDur).attr("d", line(data));

    svg.selectAll(".dot").remove();
    svg.selectAll(".dot-text").remove();

    dots = svg.selectAll(".dot")
        .data(data)
        .enter();

    dots.append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", data => data.x)
        .attr("cy", data => data.y);
    dots.append("text")
        .attr("class", "dot-text")
        .attr("x", data => data.x)
        .attr("y", data => data.y)
        .attr("dy", -10)
        .text((data, index) => rawData[index].y);

}

function addListeners() {
    let dataInput = document.getElementById('dataInput');
    dataInput.onkeypress = onEnter;
}

function onEnter(e) {
    let time = new Date;
    let inputValue = parseFloat(document.getElementById("dataInput").value);
    if (e.keyCode === 13 && !isNaN(inputValue)) {
        listOfPoints.push(addPoint(time, inputValue));
        saveInStorage(listOfPoints);
        rewriteAxes(listOfPoints, 1000);
    }
}

function isEmpty(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

function saveInStorage(item) {
    localStorage.setItem('listOfPoints', JSON.stringify(item));
}

function loadFromStorage() {
    return JSON.parse(localStorage.getItem('listOfPoints'));
}

function addPoint(time, inputValue) {
    let li = document.createElement("li");
    let timeStamp = document.createTextNode(+time + ' ');
    let t = document.createTextNode(inputValue);
    li.appendChild(timeStamp);
    li.appendChild(t);
    if (inputValue === '') {
        return;
    } else {
        document.getElementById("list-of-points").appendChild(li);
    }
    document.getElementById("dataInput").value = "";

    let button = document.createElement("button");
    let removeTxt = document.createTextNode("remove");
    button.className = "remove";
    button.appendChild(removeTxt);
    li.appendChild(button);
    button.onclick = removePoint;
    return {
        timeStamp: +time,
        y: inputValue
    };
}

function removeLiPoint(div) {
    div.style.display = "none";
    let point = {
        timeStamp: parseFloat(div.childNodes[0].nodeValue),
        y: parseFloat(div.childNodes[1].nodeValue),
    };


    let index = listOfPoints.findIndex((element) => {
        return element.timeStamp === point.timeStamp && element.y === point.y;

    });
    listOfPoints.splice(index, 1);
}

function removePoint() {
    let div = this.parentElement;
    removeLiPoint(div);
    saveInStorage(listOfPoints);
    rewriteAxes(listOfPoints, 1000);
}
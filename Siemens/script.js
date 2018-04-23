let graphicY;
let listOfPoints = [];
let path, svg, dots;

function addAxis() {
    let height = document.getElementsByClassName('graphic-panel')[0].clientHeight,
        width = document.getElementsByClassName('graphic-panel')[0].clientWidth,
        margin = 30;
// массив точек для создания пути
    let rawData = [];

    let data = [];

    let minX = Number.MAX_VALUE, maxX = 0, minY = Number.MAX_VALUE, maxY = 0;
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

    let xAxisLength = width - 2 * margin;
    let yAxisLength = height - 2 * margin;

    svg = d3.select(".graphic-panel").append("svg")
        .attr("class", "axis")
        .attr("width", width)
        .attr("height", height);

    let scaleX = d3.scale.linear()
        .domain([0, 1000])
        .range([0, xAxisLength]);
    let scaleY = d3.scale.linear()
        .domain([100, -100])
        .range([0, yAxisLength]);
    for (let i = 0; i < rawData.length; i++)
        data.push({x: scaleX(rawData[i].timeStamp) + margin, y: scaleY(rawData[i].y) + margin})
    let yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left");

    // отрисовка оси Y
    graphicY = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", // сдвиг оси вниз и вправо на margin
            "translate(" + margin + "," + margin + ")")
        .call(yAxis);
    let line = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        });
// добавляем путь
    path = svg.append("g").append("path")
        .attr("d", line(data))
        .style("stroke", "steelblue")
        .style("stroke-width", 2);

// добавляем путь
    addListeners();


}

function createAxes() {
    setTimeout(updateAxes, 0)
}

function updateAxes() {
    let height = document.getElementsByClassName('graphic-panel')[0].clientHeight,
        width = document.getElementsByClassName('graphic-panel')[0].clientWidth;
    svg.transition(100).attr("height", height)
        .attr("width", width);
    rewriteAxes(listOfPoints);
}

function rewriteAxes(rawData) {
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

    svg.attr("class", "axis")
        .attr("width", width)
        .attr("height", height);
    let range = 3;
    let scaleX = d3.scale.linear()
        .domain([minX - range * 1000, maxX + range])
        .range([0, xAxisLength]);
    let scaleY = d3.scale.linear()
        .domain([maxY + range, minY - range])
        .range([0, yAxisLength]);
    for (let i = 0; i < rawData.length; i++)
        data.push({x: scaleX(rawData[i].timeStamp) + margin, y: scaleY(rawData[i].y) + margin})
    let yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left");

    // отрисовка оси Y
    graphicY
        .attr("transform", // сдвиг оси вниз и вправо на margin
            "translate(" + margin + "," + margin + ")")
        .call(yAxis);
    let line = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        });
// добавляем путь
    path.transition(10)
        .attr("d", line(data))
        .style("stroke", "steelblue")
        .style("stroke-width", 2);

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
    let myInput = document.getElementById('myInput');
    myInput.onkeypress = onEnter;
}

function onEnter(e) {
    let time = new Date;
    let inputValue = parseFloat(document.getElementById("myInput").value);
    if (e.keyCode === 13 && !isNaN(inputValue)) {
        listOfPoints.push(addPoint(time, inputValue));
        saveInStorage(listOfPoints);
        rewriteAxes(listOfPoints)
    }
}

function isEmpty(obj) {
    for (var key in obj) {
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
    document.getElementById("myInput").value = "";

    let span = document.createElement("button");
    let txt = document.createTextNode("remove");
    span.className = "close";
    span.appendChild(txt);
    span.style.cursor = 'pointer';
    li.appendChild(span);
    span.onclick = removePoint;
    return {
        timeStamp: +time,
        y: inputValue
    };
}

function removePoint() {
    let div = this.parentElement;
    div.style.display = "none";
    let point = {
        timeStamp: parseFloat(div.childNodes[0].nodeValue),
        y: parseFloat(div.childNodes[1].nodeValue),
    };


    let index = listOfPoints.findIndex((element) => {
        return element.timeStamp === point.timeStamp && element.y === point.y;

    });
    listOfPoints.splice(index, 1);
    saveInStorage(listOfPoints);
    rewriteAxes(listOfPoints);
}


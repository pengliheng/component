import './index.less'
import Button from "../../container/button";
import Icon from "../../container/icon";
import Dom from "../../utils/dom.js";

const {
    domFunc,
    sleep,
    isDomInPathFunc,
    domToggleAnimation,
    addArrProp,
    showDomFunc,
    addEvent
} = Dom;


const Table = async args => {
    let {
        data,
        callback
    } = args;
    if(callback==undefined){
        callback=()=>{}
    }
    let mask = document.createElement('div');
    mask.className = 'component-mask';
    mask.innerHTML = `
        <div class="component-table">
            <header class="component-table-header">
                请选择
            </header>
            <div class="component-table-body">
                <div class="component-table-body-side" id="side">
                    <div class="all" id="all">
                        ${Icon({ type:'navlist' })}
                        <span class="text-container">全部</span>
                        ${Icon({ type:'unfold' })}
                    </div>
                    <div class="list-container"></div>
                    <div class="flex-container"></div>
                </div>
                <div class="component-table-body-container">
                    <span class="breadcrumb">
                        <span class="container-breadcrumb">
                            ${Icon({ type:'location' })}
                            全部 
                            ${Icon({ type:'>>' })}
                            红酒 
                            ${Icon({ type:'>>' })}
                            法斯特
                        </span>
                    </span>
                    <span class="search-container">
                        <span>商品搜索：</span>
                        <span class="search">
                            <input type="text">
                            <span>搜索</span>
                        </span>
                    </span>
                    <div class="table">
                        <div class="sec-table" id="sec-table">
                            <div class="th">
                                <span class="select">
                                    <input id="select-all" type="checkbox"/> 
                                    <label for="select-all">全选</label>
                                    <input id="select-reverse" type="checkbox"/> 
                                    <label for="select-reverse">反选</label>
                                </span>
                                <span class="num">编号</span>
                                <span class="name">名称</span>
                            </div>
                            <div class="tb-container"></div>
                        </div>
                        <div class="thr-table" id="thr-table">
                            <div class="th">
                                <span class="select">
                                    <input id="thr-select-all" type="checkbox"/> 
                                    <label for="thr-select-all">全选</label>
                                    <input id="thr-select-reverse" type="checkbox"/> 
                                    <label for="thr-select-reverse">反选</label>
                                </span>
                                <span class="num">编号</span>
                                <span class="name">名称</span>
                                <span class="empty">
                                    ${Icon({ type:'trash' })}
                                    清空
                                </span>
                            </div>
                            <div class="tb-container">
                                <div class="tb"></div>
                            </div>
                        </div>
                    </div>
                    <div class="group-btn">
                        ${Button({
                            className:"return",
                            text:"返回"
                        }).outerHTML}
                        &nbsp;
                        &nbsp;
                        ${Button({
                            className:"confirm btn-primary",
                            text:"确认"
                        }).outerHTML}
                    </div>
                </div>
            </div>
        </div>
    `;

    domFunc({
        dom:document.querySelector('html'),
        style: {
            paddingRight: `${window.innerWidth - document.body.clientWidth}px`,
            overflow: "hidden"
        }
    })
    document.body.appendChild(mask);
    await sleep(300);
    await putDataToFirTable(data.title)
    await putDataToSecTable(data.content)
    let btns = mask.querySelectorAll('.component-table button');
    btns = Array.prototype.slice.call(btns);
    await btnAddevent({btns,mask,callback})
    // 添加观察者
    await secTableObserver()
    await thrTableObserver()
    // all event proxy
    await eventProxy({
        event:'click'
    })
    await eventProxy({
        event:'change'
    })
}











const putDataToFirTable = async data => {
    let arr = data.map((row,i) => {
        let div = document.createElement('div');
        let html = `
            ${Icon({type:"wujiaoxing"})}
            <span class="text-container">` + row.name + `</span>
        `;
        div.className = "list";
        div.innerHTML = html;
        div.id = "sec"+i;
        div.dataset.type = i+1;
        div.style.cursor = "pointer";
        let container = document.querySelector('.component-table .component-table-body-side .list-container'); 
        container.appendChild(div);
    });
}

const putDataToSecTable = async data => {
    // 将数据传入data之前先清空 container
    let secTableInputs = document.querySelector('.component-table-body-container .sec-table .tb-container');
    secTableInputs = Array.prototype.slice.call(secTableInputs);
    secTableInputs.map(input => input.parentElement.remove())
    
    return data.map((row,i)=>{
        let sec_table = document.querySelector('.component-table-body-container .sec-table .tb-container');
        let div = document.createElement('div');
        div.className = "tb";
        let html = `
            <input class="select" type="checkbox"/>
            <span class="num">` + row.dept_code + `</span>
            <span class="name">` + row.name + `</span>
        `;
        div.innerHTML = html;
        div.id = "sec"+i;
        div.dataset.type = row.type;
        div.style.color = "#000";
        div.style.cursor = "pointer";
        sec_table.appendChild(div)
    })
}


const btnAddevent = (args) => {
    const {
        btns,
        mask,
        callback
    } = args;
    btns.forEach(dom=>{
        dom.addEventListener('click',()=>{
            mask.remove()
            if(dom.classList.contains('confirm')) {
                callback();
            }
        })
    })
}







const eventProxy = args => {
    const { event } = args;
    if(event=="click"){
        let handleAllEvent = e => {
            // toggle show all with first table 
            let isShowAllInPath = isDomInPathFunc({
                path: e.path,
                selector: "#all"
            })
            if(isShowAllInPath){
                // add some animation
                let more = isShowAllInPath.querySelector('.icon-unfold');
                domToggleAnimation({
                    dom: more,
                    animationDuration: "0.3s",
                    animationFillMode: "forwards",
                    animationName: ["rotate-90","rotate90"]
                })
                let listContainer = isShowAllInPath.parentElement.querySelector('.list-container');
                domToggleAnimation({
                    dom: listContainer,
                    animationDuration: "0.3s",
                    animationFillMode: "forwards",
                    animationName: ["slidein","slideout"]
                })
            }
            // filter second table
            let firstTableLists = document.querySelectorAll('.list-container .list')
            firstTableLists = Array.prototype.slice.call(firstTableLists)
            firstTableLists.map((list,i)=>{
                let isDomInPath = isDomInPathFunc({
                    path: e.path,
                    selector: ".list-container .list:nth-child(" + (i+1) + ")"
                })
                if(isDomInPath){
                    let allList = isDomInPath.parentElement.querySelectorAll('.list')
                    allList = Array.prototype.slice.call(allList);
                    allList.map(dom=>{
                        dom.dataset.active=false;
                        dom.classList.remove('active')
                    });
                    isDomInPath.dataset.active = true
                    isDomInPath.classList.add('active')
                }
            })
            // empty
            let isEmptyDom = isDomInPathFunc({
                path: e.path,
                selector: ".thr-table .empty"
            })
            if(isEmptyDom){
                let inputs  = isEmptyDom.parentElement.parentElement.querySelectorAll('.tb-container input.select');
                inputs.forEach((input) => {
                    if(input.parentElement.style.display != 'none') {
                        input.parentElement.remove()
                        inputs = document.querySelectorAll('.sec-table input');
                        inputs.forEach(input => input.checked = false)
                    }
                })
            }
        }
        document.body.addEventListener(event, handleAllEvent, false)
    }
    if(event=='change'){
        let handleAllEvent = e =>{
            // selectAll
            let isSelectAllDom = isDomInPathFunc({
                path: e.path,
                selector: ".select #select-all"
            })
            if(isSelectAllDom){
                let inputs  = isSelectAllDom.parentElement.parentElement.parentElement.querySelectorAll('.tb-container input.select');
                inputs.forEach((input) => {
                    if(input.parentElement.style.display!='none') {
                        input.checked =  e.target.checked;
                        input.dataset.checked  =  e.target.checked;
                    }
                })
            }
            // selectReverse
            let isSelectReverseDom = isDomInPathFunc({
                path: e.path,
                selector: ".select #select-reverse"
            })
            if(isSelectReverseDom){
                let inputs  = isSelectReverseDom.parentElement.parentElement.parentElement.querySelectorAll('.tb-container input.select');
                inputs.forEach((input) => {
                    if(input.parentElement.style.display!='none') {
                        input.checked =  !input.checked;
                        input.dataset.checked  =  input.checked;
                    }
                })
            }
        }
        document.body.addEventListener(event, handleAllEvent, false)
    }
}












const secTableObserver =  (args) => {
    let fir_table_container = document.querySelector('.component-table-body-side .list-container');
    let sec_table_container = document.querySelector('.component-table-body-container .sec-table .tb-container');
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    let observer = new MutationObserver((mutations) => {
        let target = mutations.filter(mutation => mutation.target.dataset.active=='true')
        if(!target.length) return 
        let index = target[0].target.dataset.type
        let allDom = sec_table_container.querySelectorAll('input');
        allDom = addArrProp(allDom).map(dom=>dom.parentElement);
        let showDom = sec_table_container.querySelectorAll('input');
        showDom = addArrProp(showDom).map(dom=> dom.parentElement).filter(dom=> dom.dataset.type==index);
        showDomFunc({
            allDom,
            showDom
        });
    });
    // 配置观察选项:
    let config = { 
        subtree: true,
        childList: true, 
        attributes: true, 
        characterData: true
    }
    observer.observe(fir_table_container, config);
}

const thrTableObserver = (args) => {
    ////不适合单独监听啊，，直接复制选中的元素好了，垃圾算法
    let sec_table_container = document.querySelector('.component-table-body-container .sec-table .tb-container');
    let thr_table_container = document.querySelector('.component-table-body-container .thr-table .tb-container');
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    let observer = new MutationObserver((mutations) => {
        let inputGroupAll = thr_table_container.querySelectorAll('input');
        inputGroupAll = Array.prototype.slice.call(inputGroupAll);
        inputGroupAll.map((input,i)=>{
            input.parentElement.remove()
        })
        let inputGroup = sec_table_container.querySelectorAll('input:checked');
        inputGroup = Array.prototype.slice.call(inputGroup);
        inputGroup.map((input,i) => {
            console.log(input);
            let div = input.parentElement;
            let newChild = div.cloneNode(true);
            let oldChild = thr_table_container.querySelector('div:nth-child('+ (i+1) +')');
            newChild.style.display = "flex";
            addEvent({
                dom: newChild,
                envet: "click",
                func: e=>e.path.filter(e=>e.className=='tb')[0].remove()
            })
            thr_table_container.insertBefore(newChild,oldChild);
            newChild.scrollIntoView({behavior: "instant", block: "end", inline: "nearest"})
        })
    });
    let config = { 
        attributes: true, 
        childList: true, 
        characterData: true ,
        subtree: true
    }
    observer.observe(sec_table_container, config);
}





export default Table;
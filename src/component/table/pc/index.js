import styles from './index.less';
import Button from '../../../container/button/pc';
import Icon from '../../../container/icon/pc';
import Dom from '../../../utils/dom';
import Pagination from '../../../container/Pagination/pc';

const {
  domFunc,
  addEvent,
  isDomFunc,
  addArrProp,
  isDomInPathFunc,
  isNumeric,
  fetchData,
  createElementFromHTML,
} = Dom;

const selectBeforeFunc = (args) => {
  const {
    beforeSelect,
  } = args;
  const contents = document.querySelectorAll('#sec-table-tb-container >div');
  addArrProp(contents).forEach((content) => {
    beforeSelect.forEach((select) => {
      const name = content.querySelector(`.${styles.name}`);
      if (name.innerText === select) {
        content.click();
      }
    });
  });
};

const btnAddevent = (args) => {
  const {
    btns,
    mask,
    data,
    next,
    rebackBtn,
  } = args;
  btns.forEach((dom) => {
    if (dom.id === 'confirm') {
      dom.addEventListener('click', () => {
        let doms = document.querySelectorAll('#thr-table-tb-container input');
        doms = Array.prototype.slice.call(doms);
        doms = doms.map(activeDom => data[activeDom.parentElement.dataset.index]);
        console.log('输出的数据：', doms);
        next(doms);
        rebackBtn();
        mask.remove();
        domFunc({
          dom: document.querySelector('html'),
          style: {
            paddingRight: '0',
            overflow: 'auto',
          },
        });
      });
    } else if (dom.id === 'return') {
      dom.addEventListener('click', () => {
        rebackBtn();
        mask.remove();
        domFunc({
          dom: document.querySelector('html'),
          style: {
            paddingRight: '0',
            overflow: 'auto',
          },
        });
      });
    }
  });
};

const putDataToSecTable = async ({ data, tableHead }) => {
  // 将数据传入data之前先清空 container
  let secTableInputs = document.querySelector('#sec-table-tb-container');
  secTableInputs = Array.prototype.slice.call(secTableInputs);
  secTableInputs.map(input => input.parentElement.remove());
  data.forEach((row, i) => {
    const secTable = document.querySelector('#sec-table-tb-container');
    const div = document.createElement('label');
    div.className = `${styles.tb} ${i > 19 ? styles.hide : ''}`;
    div.dataset.index = i;
    div.htmlFor = `select-second-${i}`;
    let html = `
      <input class="${styles.select}" type="${select_model}" name="select" id="select-second-${i}"/>
    `;
    addArrProp(tableHead).forEach((dom) => {
      const id = dom.dataset.field;
      if (id !== undefined && id !== 'id' && id !== 'user_id') {
        html += `<span class="${styles[id === 'name' ? 'name' : 'num']}" style="width:${dom.style.width}">${row[id]}</span>`;
      }
    });
    div.innerHTML = html;
    div.id = `sec${i}`;
    div.dataset.type = row.type;
    secTable.appendChild(div);
  });
};

const eventProxy = (args) => {
  const { event } = args;
  const domAddEvent = args.domAddEvent || document.querySelector(`.${styles['component-mask']}`);
  if (event === 'click') {
    const handleAllEvent = (e) => {
      // empty
      const isEmptyDom = isDomInPathFunc({
        path: e.path,
        selector: `.${styles.empty}`,
      });
      if (isEmptyDom) {
        let inputs = isEmptyDom.parentElement.parentElement.querySelectorAll(`.${styles['tb-container']} .${styles.select}`);
        inputs.forEach((input) => {
          if (input.parentElement.style.display !== 'none') {
            input.parentElement.remove();
            inputs = document.querySelectorAll(`.${styles['sec-table']} input`);
            inputs.forEach(inputDom => inputDom.checked = false);
          }
        });
      }
      // 为第三个表格每一个列表添加点击事件, 就是点击第二个表格，由第二个表格触发第三个表格事件
      document.querySelectorAll(`#thr-table-tb-container .${styles.tb}`).forEach((dom) => {
        const isTableList = isDomFunc({
          path: e.path, dom,
        });
        if (isTableList) {
          const tableListIndex = isTableList.dataset.index;
          if (select_model === 'radio') {
            document.querySelector('#empty').click();
          } else if (select_model === 'checkbox') {
            document.querySelector(`#sec-table-tb-container label:nth-child(${Number(tableListIndex) + 1})`).click();
          }
        }
      });
    };
    domAddEvent.addEventListener(event, handleAllEvent, false);
  } else if (event === 'change') {
    const handleAllEvent = (e) => {
      // selectAll
      const isSelectAllDom = isDomInPathFunc({
        path: e.path,
        selector: '#select-all',
      });
      if (isSelectAllDom) {
        const inputs = isSelectAllDom.parentElement.parentElement.parentElement.querySelectorAll(`.${styles['tb-container']} .${styles.select}`);
        inputs.forEach((input) => {
          if (input.parentElement.style.display !== 'none') {
            input.checked = e.target.checked;
            input.dataset.checked = e.target.checked;
          }
        });
      }
      // selectReverse
      const isSelectReverseDom = isDomInPathFunc({
        path: e.path,
        selector: '#select-reverse',
      });
      if (isSelectReverseDom) {
        const inputs = isSelectReverseDom.parentElement.parentElement.parentElement.querySelectorAll(`.${styles['tb-container']} .${styles.select}`);
        inputs.forEach((input) => {
          if (input.parentElement.style.display !== 'none') {
            input.checked = !input.checked;
            input.dataset.checked = input.checked;
          }
        });
      }
      // 为第二个表格每一个列表添加点击事件，tb-container
      const isTableList = isDomFunc({
        path: e.path,
        dom: document.querySelector('#sec-table-tb-container'),
      });
      if (isTableList) {
        isTableList.dataset.select = Math.random();
      }
    };
    domAddEvent.addEventListener(event, handleAllEvent, false);
  } else if (event === 'keyup') {
    const handleAllEvent = (e) => {
      const searchValue = e.target.value.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      const allList = document.querySelector('#sec-table-tb-container').children;
      const filterList = addArrProp(allList).filter((list) => {
        // 双边帅选规则
        if(!list.querySelector(`.${styles.num}`)){
          // 至匹配名字
          let nameValue = list.querySelector(`.${styles.name}`).innerText;
          let nameRegex = new RegExp(`${searchValue}`);
          return nameValue.match(nameRegex);
        }
        let numValue = list.querySelector(`.${styles.num}`).innerText;
        let numRegex = new RegExp(`^${searchValue}`);
        let nameValue = list.querySelector(`.${styles.name}`).innerText;
        let nameRegex = new RegExp(`${searchValue}`);
        return nameValue.match(nameRegex) || numValue.match(numRegex);
      });
      addArrProp(allList).forEach((dom) => {
        dom.style.display = 'none';
      });
      addArrProp(filterList).forEach((dom, i) => {
        if (i % 2 === 1) {
          dom.style.backgroundColor = '#f9f9f9';
        } else {
          dom.style.backgroundColor = '#fff';
        }
        dom.style.display = 'flex';
      });
    };
    domAddEvent.addEventListener(event, handleAllEvent, false);
  }
};

const thrTableObserver = () => {
  // //不适合单独监听啊，，直接复制选中的元素好了，垃圾算法
  const secTableContainer = document.querySelector('#sec-table-tb-container');
  const thrTableContainer = document.querySelector('#thr-table-tb-container');
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  const observer = new MutationObserver(() => {
    let inputGroupAll = thrTableContainer.querySelectorAll('input');
    inputGroupAll = Array.prototype.slice.call(inputGroupAll);
    inputGroupAll.forEach((input) => {
      input.parentElement.remove();
    });
    let inputGroup = secTableContainer.querySelectorAll('input:checked');
    inputGroup = Array.prototype.slice.call(inputGroup);
    inputGroup.map((input, i) => {
      const div = input.parentElement;
      const newChild = div.cloneNode(true);
      const oldChild = thrTableContainer.querySelector(`div:nth-child(${i + 1})`);
      newChild.style.display = 'flex';
      addEvent({
        dom: newChild,
        envet: 'click',
        func: e => e.path.filter(_e => _e.className === styles.tb)[0].remove(),
      });
      thrTableContainer.insertBefore(newChild, oldChild);
      newChild.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'nearest' });
    });
  });
  const config = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  };
  observer.observe(secTableContainer, config);
};

const paginationObserver = ({ paginationStyles, paginationContainer }) => {
  // 监听分页当前被选中元素
  const pagination = document.querySelector('#pagination');
  const secTableContainer = document.querySelector('#sec-table-tb-container');
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  const observer = new MutationObserver(() => {
    // let activeDom = pagination.querySelector
    let index = paginationContainer.querySelector(`.${paginationStyles.active}`).id.replace(/sec/, '');
    index = Number(index);
    addArrProp(secTableContainer.children).forEach((dom, i) => {
      if (index * 20 <= i && i < (index + 1) * 20) {
        dom.classList.remove(styles.hide);
      } else {
        dom.classList.add(styles.hide);
      }
    });
  });
  const config = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  };
  observer.observe(pagination, config);
};

const Table = async (args) => {
  const {
    data,
    next,
    beforeSelect,
    pars,
    rebackBtn,
  } = args;
  window.select_model = args.select_model;
  const ifselect = args.ifselect || true;
  console.log('拿到的数据：', data);
  const mask = document.createElement('div');
  mask.className = styles['component-mask'];
  mask.innerHTML = `
    <div class="${styles['component-table']}">
      <header class="${styles['component-table-header']}">请选择</header>
      <div class="${styles['component-table-body']}">
        <div class="${styles['component-table-body-container']}">
          <div class="${styles.table}">
            <div class="${styles['sec-table']}" id="sec-table">
              <span class="${styles.thh}">
                <span class="${styles.search}">
                  <input id="search" type="text">
                  <span>搜索</span>
                </span>
              </span>
              <div class="${styles.th}">
                <span class="${styles.select}">
                  ${select_model === 'checkbox' ? `
                    <input id="select-all" type="checkbox"/> 
                    <label for="select-all">全选</label>
                  ` : ''}
                </span>
              </div>
              <form class="${styles['tb-container']}" id="sec-table-tb-container"></form>
              <span class="${styles.tbb}" id="pagination"></span>
            </div>
            <div class="${styles['thr-table']}" id="thr-table">
              <h3 class="${styles.thh} ${styles.title}">当前已选中</h3>
              <div class="${styles.th}">
                <span class="${styles.index}">序号</span>
                <span class="${styles.name}">名称</span>
                ${select_model === 'checkbox' ? `
                    <span class="${styles['empty-btn']}" id="empty">
                      ${Icon({ type: 'trash' })}
                      清空
                    </span>
                  ` : ''}
                </div>
              <div class="${styles['tb-container']}" id="thr-table-tb-container"></div>
              <span class="${styles.tbb}">
                ${Button({ id: 'return', text: '返回', type: 'daocheng-cancel' }).outerHTML}&nbsp;&nbsp;
                ${Button({ id: 'confirm', text: '确认', type: 'daocheng-confirm' }).outerHTML}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  domFunc({
    dom: document.querySelector('html'),
    style: {
      paddingRight: `${window.innerWidth - document.body.clientWidth}px`,
      overflow: 'hidden',
    },
  });
  document.body.appendChild(mask);
  // await sleep(300);
  const getTableHTML = await fetchData({
    url: `https://www.kingubo.cn/frontend/api/pc/getSelectTemplate/${pars.tempid}`,
    data: '',
    header: {
      method: 'GET',
      'Access-Control-Allow-Origin': '*',
      mode: 'include',
    },
  });
  const tableHead = createElementFromHTML(getTableHTML.data).querySelectorAll('thead tr th');
  addArrProp(tableHead).forEach((dom) => {
    const id = dom.dataset.field;
    if (!dom.querySelector('input') && id !== 'id' && id !== 'user_id') {
      mask.querySelector(`#sec-table .${styles.th}`).innerHTML += `
        <span class="${styles.num}" style="width:${dom.style.width}">${dom.innerText}</span>
      `;
    }
  });

  await putDataToSecTable({
    data,
    tableHead,
  });
  let btns = mask.querySelectorAll(`.${styles['component-table']} button`);
  btns = Array.prototype.slice.call(btns);
  await btnAddevent({
    btns, mask, data, next, rebackBtn,
  });
  // 添加观察者
  await thrTableObserver();
  // all event proxy
  await eventProxy({
    event: 'click',
  });
  await eventProxy({
    event: 'change',
  });
  await eventProxy({
    event: 'keyup',
    domAddEvent: document.querySelector('#search'),
  });

  const pagination = Pagination({
    data,
    id: 'pagination',
    defaultValue: '0',
    limit: 20,
  });
  document.querySelector('#pagination').appendChild(pagination.container);
  paginationObserver({
    paginationStyles: pagination.styles,
    paginationContainer: pagination.container,
  });
  if (ifselect) {
    selectBeforeFunc({
      beforeSelect,
    });
  }
};


export default Table;

import styles from './index.less';
import Dom from '../../../utils/dom';
import Icon from '../../../container/icon/pc';
import Button from '../../../container/button/pc';
import Tree from '../../../container/tree/pc';

const {
  domFunc,
  isDomFunc,
  addArrProp,
  isIdInPathFunc,
  composedPath,
} = Dom;

const btnAddevent = (args) => {
  const {
    btns,
    mask,
    next,
  } = args;
  btns.forEach((dom) => {
    if (dom.id === 'confirm') {
      dom.addEventListener('click', () => {
        let doms = document.querySelectorAll('#thr-table-tb-container label');
        doms = Array.prototype.slice.call(doms);
        doms = doms.map(activeDom => JSON.parse(activeDom.id));
        console.log('输出的数据：', doms);
        next(doms);
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


const eventProxy = (args) => {
  const {
    event, selectModel, domAddEvent, treeDom,
  } = args;
  if (event === 'click') {
    const handleAllEvent = (e) => {
      const path = e.path || (e.composedPath && e.composedPath()) || composedPath(e.target);
      // empty ，暴力清除所有
      const isEmptyDom = isIdInPathFunc({
        path,
        id: 'empty',
      });
      if (isEmptyDom) {
        treeDom.querySelector('#empty').click();
      }
      // 为第三个表格每一个列表添加点击事件, 就是点击第二个表格，由第二个表格触发第三个表格事件
      addArrProp(document.querySelectorAll(`#thr-table-tb-container .${styles.tb}`)).forEach((dom) => {
        const isTableList = isDomFunc({
          path, dom,
        });
        if (isTableList) {
          if (selectModel === 'radio') {
            document.querySelector('#empty').click();
          } else if (selectModel === 'checkbox') {
            const jsonData = dom.id;
            document.querySelector(`#tree-container li[data-json='${jsonData}']`).click();
          }
        }
      });
      const bodyContainer = document.querySelector(`.${styles['body-container']}`);
      // 是否弹出表格
      const isTableContainer = isIdInPathFunc({
        path,
        id: 'thr-table',
      });
      const isShow = isIdInPathFunc({
        path,
        id: 'show',
      });
      if (isTableContainer) {
        bodyContainer.classList.remove(styles.hide)
      } else if (isShow) {
        if(
          bodyContainer.classList.contains(styles.hide)
        ){
          bodyContainer.classList.remove(styles.hide)
        }else{
          bodyContainer.classList.add(styles.hide)
        }
      }else {
        bodyContainer.classList.add(styles.hide)
      }
      // sync the num with 
      setTimeout(() => {
        document.querySelector(`.${styles.num} font`).innerHTML=document.querySelectorAll('#thr-table-tb-container > label').length;
      }, 5);
    };
    domAddEvent.addEventListener(event, handleAllEvent);
  }
};


const thrTableObserver = ({ treeStyles }) => {
  const treeContainer = document.querySelector('#tree-container');
  const thrTableContainer = document.querySelector('#thr-table-tb-container');
  const MutationObserver = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver);
  const observer = new MutationObserver(() => {
    document.querySelector('#thr-table-tb-container').innerHTML = '';
    addArrProp(document.querySelectorAll(`.${treeStyles.tree} .${treeStyles.active}`)).forEach((dom) => {
      const jsonData = JSON.parse(dom.dataset.json);
      const div = document.createElement('label');
      div.className = styles.tb;
      div.id = JSON.stringify(jsonData);
      div.htmlFor = jsonData;
      const html = `
        <span class="${styles.name}">${jsonData.name}</span>
        <span class="${styles.empty}">㊀</span>
      `;
      div.innerHTML = html;
      // div.style.color = '#000';
      div.style.cursor = 'pointer';
      thrTableContainer.appendChild(div);
    });
  });
  // 配置观察选项:
  const config = {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  };
  observer.observe(treeContainer, config);
};


const tree = async (args) => {
  const {
    data,
    next,
    beforeSelect,
    corpName
  } = args;
  const selectModel = args.select_model;
  console.log('tree 拿到的数据', data);
  window.top.dataa = data;
  const ifselect = args.ifselect || true;
  const mask = document.createElement('div');
  mask.className = styles.mask;
  mask.innerHTML = `
    <div class="${styles.tree}">
      <header class="${styles.header}">
        ${Icon({ type: '<', id: 'return' })}
        <span>请选择</span>
        <span class="${styles.right}"></span>
      </header>
      <div class="${styles.body}">
        <div class="${styles['body-side']}" id="side"></div>
        <div class="${styles['body-container']} ${styles.hide}">
          <div class="${styles.table}">
            <div class="${styles['thr-table']}" id="thr-table">
              <div class="${styles.th}">
                <span class="${styles.name}">已选择</span>
                <span class="${styles['empty-btn']}" id="empty">
                  ${Icon({ type: 'trash' })}
                  清空
                </span>
              </div>
              <div class="${styles['tb-container']}" id="thr-table-tb-container"></div>
            </div>
          </div>
        </div>
      </div>
      <footer class="${styles.footer}">
        ${Icon({ type: 'daocheng', id: 'daocheng' })}
        <span class="${styles.num}">
          已选择
          <font>${0}</font>
          人
        </span>
        <span class="${styles.iconfont}" id="show">
          查看
          ${Icon({ type: '>' })}
        </span>
        <span class="${styles.confirm}" id="confirm">确认</span>
      </footer>
    </div>`;
  const tree = Tree({ data, beforeSelect, selectModel,corpName });
  const treeDom = tree.container;
  const treeStyles = tree.styles;
  mask.querySelector('#side').appendChild(treeDom);
  document.body.appendChild(mask);
  // await sleep(300);
  await btnAddevent({
    btns: [
      document.querySelector('#return'),
      document.querySelector('#confirm')
    ], mask, data: data.content, next,
  });
  // 添加观察者
  await thrTableObserver({ selectModel, treeStyles });
  // all event proxy
  await eventProxy({
    event: 'click',
    selectModel,
    domAddEvent: mask,
    treeDom,
    treeStyles,
  });
  // await eventProxy({
  //   event: 'change',
  // });
  // 隐藏外部滚动条
  domFunc({
    dom: document.querySelector('html'),
    style: {
      paddingRight: `${window.innerWidth - document.body.clientWidth}px`,
      overflow: 'hidden',
    },
  });
};

export default tree;

import $ from '../../utils/jquery.js';
import './index.less'
import Icon from "../../container/icon";

const Modal = args => {
    let {
        type,
        content,
        callback,
        time
    } = args;
    type = (type == undefined ? "info" : type);
    time = (time == undefined ? 1000 : time);
    content = (content == undefined ? "{content: 请输入content参数}" : content);
    callback = (callback == undefined ? ()=>{} : callback);

    if(document.querySelector('.component-container')){
        var container = document.querySelector('.component-container');
    } else {
        var container = document.createElement('div');
        container.className = 'component-container';
        document.body.appendChild(container)
    }
    let message = document.createElement('div');
    message.className = `component-container-message ${type}`;
    message.innerHTML = `
        ${Icon({ type })}
        &nbsp;
        ${ content }
    `;
    setTimeout(() => {
        message.remove()
    }, time);
    container.appendChild(message);
}

// let removeAnimation = e =>{
//     const {
//         dom,
//         styles
//     } = e
//     for(let style in styles){
//         console.log(
//             style,": ",styles[style]
//         );
//         dom.style[style] = styles[style]
//     }
// }

export default Modal;

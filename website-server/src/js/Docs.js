import {ls} from './LanguageSwitcher.js';
import React from 'react';

function DOCS () {
    return (<h1>
       {ls.Trans('docs')}
    </h1>)
}

function FAQ() { return (
    <h1>
        {ls.Trans('faq')}
    </h1>
)}

function SHORT_INTRO(){
    return (
        <div className='card container Docs'>
            <h2> {ls.Trans("doc1_title")} </h2>
            <p>
            Do you have the experience that you are in low mood, but you find it hard to tell it to your family or friends? Well, welcome to <b>Message Bottles</b>, a safe space for sharing your thoughts and emotions <i>anonymously</i>. <br/><br/> Here, you can freely express the feelings and struggles that are hard to voice elsewhere. Your words will drift like a message in a bottle, to be randomly discovered and responded to by others. <br/><br/> Together, let's support each other through life's ups and downs!
            </p>
            <hr/>
            <h4> {ls.Trans("doc2_title")} </h4>
            <p>
                Until now, this website is just built by myself, who just began to learn web development (and the <a href="https://react.dev" >React</a> package) for less than a week. Clearly, the website is far from perfect now. Thus, if you are interested, feel free to contribute to the project <a href="https://github.com/Hidden-Hyperparameter/message-website">Here</a>!
            </p>
        </div>
    );
}

export default SHORT_INTRO;
export {DOCS,FAQ};
import React, { Component, PureComponent } from 'react';

import WrapperHeaderContext from '~/screens/news_v3/view/list_news_wrapper/wrapper_header/WrapperHeaderContext.js';
import * as Controller from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_content_controller.js'
import * as Model from '~/screens/news_v3/model/header_list_news/header.model.js'
export default class extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <WrapperHeaderContext.Provider
            >
                {this.props.children}
            </WrapperHeaderContext.Provider>
        );
    }
}

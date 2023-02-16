import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import _ from 'lodash';
import CommonStyle from '~/theme/theme_controller';

export const objInfo = {
  add: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" data-name="Layer 2" viewBox="0 0 50 50" x="0px" y="0px"><title>Artboard 24</title><path d="M40.5562,9.4438A22,22,0,1,0,9.4438,40.5562,22,22,0,1,0,40.5562,9.4438ZM39,26H26V39a1,1,0,0,1-2,0V26H11a1,1,0,0,1,0-2H24V11a1,1,0,0,1,2,0V24H39a1,1,0,0,1,0,2Z"></path></svg>`,
    textFillColor: `#ffffff`
  },
  categoryFilter: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" x="0px" y="0px"><title>location, park, venue, filter</title><path d="M28.88,4.52A1,1,0,0,0,28,4H4a1,1,0,0,0-.84,1.54L12,19.29V27a1,1,0,0,0,.42.81A.94.94,0,0,0,13,28a1.19,1.19,0,0,0,.32-.05l6-2A1,1,0,0,0,20,25V19.29L28.84,5.54A1,1,0,0,0,28.88,4.52ZM18.16,18.46A1,1,0,0,0,18,19v5.28l-4,1.33V19a1,1,0,0,0-.16-.54L5.83,6H26.17Z"></path></svg>`,
    textFillColor: `#ffffff`
  },
  changeWatchlist: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#fff"
            viewBox="0 0 100 100"
        >
            <path d="M40 10.8H18.8c-4.4 0-8 3.6-8 8V40c0 4.4 3.6 8 8 8H40c4.4 0 8-3.6 8-8V18.8c0-4.4-3.6-8-8-8zM44 40c0 2.2-1.8 4-4 4H18.8c-2.2 0-4-1.8-4-4V18.8c0-2.2 1.8-4 4-4H40c2.2 0 4 1.8 4 4V40zm37.2-29.2H60c-4.4 0-8 3.6-8 8V40c0 4.4 3.6 8 8 8h21.2c4.4 0 8-3.6 8-8V18.8c0-4.4-3.6-8-8-8zm4 29.2c0 2.2-1.8 4-4 4H60c-2.2 0-4-1.8-4-4V18.8c0-2.2 1.8-4 4-4h21.2c2.2 0 4 1.8 4 4V40zM40 52H18.8c-4.4 0-8 3.6-8 8v21.2c0 4.4 3.6 8 8 8H40c4.4 0 8-3.6 8-8V60c0-4.4-3.6-8-8-8zm4 29.2c0 2.2-1.8 4-4 4H18.8c-2.2 0-4-1.8-4-4V60c0-2.2 1.8-4 4-4H40c2.2 0 4 1.8 4 4v21.2zM81.2 52H60c-4.4 0-8 3.6-8 8v21.2c0 4.4 3.6 8 8 8h21.2c4.4 0 8-3.6 8-8V60c0-4.4-3.6-8-8-8zm4 29.2c0 2.2-1.8 4-4 4H60c-2.2 0-4-1.8-4-4V60c0-2.2 1.8-4 4-4h21.2c2.2 0 4 1.8 4 4v21.2z"></path>
        </svg>`,
    textFillColor: `#ffffff`
  },
  delete: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill-rule="evenodd" clip-rule="evenodd" d="M78.291,16.552c0.167,0.668-0.05,1.117-0.65,1.351l-54.5,17.75h-0.3  c-0.267,0-0.45-0.033-0.55-0.101c-0.233-0.133-0.4-0.332-0.5-0.6l-3.3-10.35c-0.167-0.633,0.05-1.066,0.65-1.301l17.6-5.649  l-1.6-4.851c-0.067-0.299-0.034-0.566,0.1-0.799c0.133-0.234,0.317-0.417,0.55-0.551l19.9-6.4c0.633-0.166,1.066,0.051,1.3,0.65  l1.55,4.801l15.05-4.951c0.333-0.066,0.6-0.033,0.8,0.101c0.233,0.134,0.417,0.317,0.55,0.55L78.291,16.552z M58.041,47.753  c-0.667,0-1,0.35-1,1.049v39.101c0,0.7,0.333,1.05,1,1.05c0.3,0,0.55-0.083,0.75-0.25c0.2-0.199,0.3-0.467,0.3-0.8V48.802  C59.091,48.103,58.741,47.753,58.041,47.753z M69.941,48.003c-0.2,0.166-0.317,0.399-0.35,0.699l-3.6,39.15  c-0.033,0.267,0.05,0.517,0.25,0.75c0.167,0.199,0.4,0.316,0.7,0.35h0.1c0.566,0,0.883-0.316,0.95-0.949l3.55-39.15  c0.033-0.301-0.034-0.551-0.2-0.75c-0.2-0.2-0.433-0.316-0.7-0.35C70.374,47.72,70.141,47.802,69.941,48.003z M81.291,40.503  c0.233,0.266,0.316,0.549,0.25,0.85l-5.7,52.8c-0.066,0.567-0.383,0.851-0.95,0.851h-44.8c-0.566,0-0.883-0.283-0.95-0.851  l-5.7-52.8c-0.067-0.301,0.017-0.584,0.25-0.85c0.167-0.201,0.417-0.301,0.75-0.301h56.1C80.908,40.202,81.158,40.302,81.291,40.503  z M35.441,48.702c-0.033-0.3-0.15-0.55-0.35-0.75c-0.2-0.166-0.433-0.232-0.7-0.199c-0.267,0.033-0.483,0.149-0.65,0.35  c-0.233,0.199-0.333,0.449-0.3,0.75l3.55,39.15c0.067,0.633,0.383,0.949,0.95,0.949h0.1c0.267-0.033,0.5-0.15,0.7-0.35  c0.167-0.233,0.233-0.483,0.2-0.75L35.441,48.702z M47.941,48.802c0-0.699-0.35-1.049-1.05-1.049c-0.667,0-1,0.35-1,1.049v39.101  c0,0.7,0.333,1.05,1,1.05c0.7,0,1.05-0.35,1.05-1.05V48.802z"></path></svg>`,
    textFillColor: `#171b29`
  },
  durationFilter: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><g><path d="M50,96.5c24.5,0,44.5-20,44.5-44.5S74.5,7.5,50,7.5S5.5,27.5,5.5,52S25.5,96.5,50,96.5z M50,15.5   c20.1,0,36.5,16.4,36.5,36.5S70.1,88.5,50,88.5S13.5,72.1,13.5,52S29.9,15.5,50,15.5z"></path><polygon points="65.6,66 69.4,59 53,50.1 53,24 45,24 45,52.5 47.1,56  "></polygon></g></svg>`,
    textFillColor: `#ffffff`
  },
  equixLogo: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="24"
            height="28"
            viewBox="0 0 24 28"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g transform="translate(-175 -736)">
                <g transform="translate(0 725)">
                <image
                    width="24"
                    height="28"
                    x="173"
                    y="11"
                    xlinkHref="data:image/png;base64,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"
                ></image>
                </g>
            </g>
            </g>
        </svg>`,
    textFillColor: `#171B29`
  },
  favouriteStar: {
    xml: `<svg height='100px' width='100px'  fill="#ffe000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M94.976,39.716c-0.056-0.172-0.204-0.296-0.383-0.323L64.054,34.92L50.448,6.98c-0.08-0.164-0.246-0.268-0.427-0.268  c0,0,0,0,0,0c-0.182,0-0.347,0.103-0.427,0.267L35.939,34.92L5.407,39.393c-0.179,0.027-0.327,0.151-0.383,0.322  c-0.056,0.172-0.011,0.36,0.118,0.487l22.077,21.801l-5.219,30.729c-0.03,0.179,0.044,0.36,0.19,0.465  c0.083,0.059,0.181,0.09,0.279,0.09c0.076,0,0.153-0.019,0.223-0.056L50.02,78.735l27.273,14.496  c0.16,0.085,0.354,0.072,0.502-0.034c0.147-0.106,0.221-0.287,0.19-0.465l-5.234-30.729l22.107-21.8  C94.987,40.076,95.033,39.887,94.976,39.716z"></path></svg>`,
    textFillColor: `#ffe000`
  },
  marketOpen: {
    xml: `<svg height='100px' width='100px'  fill="#30ff8f" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M50,2C23.5,2,2,23.5,2,50c0,26.5,21.5,48,48,48s48-21.5,48-48C98,23.5,76.5,2,50,2z M74.7,38.4L46.5,66.7  c-0.9,0.9-2.2,1.5-3.5,1.5s-2.6-0.5-3.5-1.5L25.3,52.5c-2-2-2-5.1,0-7.1c2-2,5.1-2,7.1,0l10.6,10.6l24.7-24.7c2-2,5.1-2,7.1,0  C76.7,33.3,76.7,36.4,74.7,38.4z"></path></svg>`,
    textFillColor: `#30ff8f`
  },
  menu: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1024 1024" style="enable-background:new 0 0 1024 1024;" xml:space="preserve"><g><g><g><path d="M127.9,300.9c6.8,0,13.7,0,20.5,0c18.6,0,37.2,0,55.8,0c27.5,0,55.1,0,82.6,0c33.6,0,67.2,0,100.8,0     c37,0,73.9,0,110.9,0c37.2,0,74.3,0,111.5,0c34.6,0,69.3,0,103.9,0c29.3,0,58.5,0,87.8,0c21.1,0,42.1,0,63.2,0     c10,0,20,0.1,29.9,0c0.4,0,0.9,0,1.3,0c12.8,0,26.3-5.6,35.4-14.6c8.7-8.7,15.2-22.9,14.6-35.4c-0.6-12.9-4.8-26.3-14.6-35.4     c-9.8-9-21.8-14.6-35.4-14.6c-6.8,0-13.7,0-20.5,0c-18.6,0-37.2,0-55.8,0c-27.5,0-55.1,0-82.6,0c-33.6,0-67.2,0-100.8,0     c-37,0-73.9,0-110.9,0c-37.2,0-74.3,0-111.5,0c-34.6,0-69.3,0-103.9,0c-29.3,0-58.5,0-87.8,0c-21.1,0-42.1,0-63.2,0     c-10,0-20-0.1-29.9,0c-0.4,0-0.9,0-1.3,0c-12.8,0-26.3,5.6-35.4,14.6c-8.7,8.7-15.2,22.9-14.6,35.4c0.6,12.9,4.8,26.3,14.6,35.4     C102.3,295.3,114.3,300.9,127.9,300.9L127.9,300.9z"></path></g></g><g><g><path d="M127.9,562.4c18.9,0,37.9,0,56.8,0c45.1,0,90.2,0,135.4,0c54.9,0,109.8,0,164.6,0c47.1,0,94.3,0,141.4,0     c23,0,46,0.3,69,0c0.3,0,0.6,0,1,0c12.8,0,26.3-5.6,35.4-14.6c8.7-8.7,15.2-22.9,14.6-35.4c-0.6-12.9-4.8-26.3-14.6-35.4     c-9.8-9-21.8-14.6-35.4-14.6c-18.9,0-37.9,0-56.8,0c-45.1,0-90.2,0-135.4,0c-54.9,0-109.8,0-164.6,0c-47.1,0-94.3,0-141.4,0     c-23,0-46-0.3-69,0c-0.3,0-0.6,0-1,0c-12.8,0-26.3,5.6-35.4,14.6c-8.7,8.7-15.2,22.9-14.6,35.4c0.6,12.9,4.8,26.3,14.6,35.4     C102.3,556.8,114.3,562.4,127.9,562.4L127.9,562.4z"></path></g></g><g><g><path d="M127.9,823.9c12.2,0,24.4,0,36.6,0c29.3,0,58.7,0,88,0c35.5,0,71,0,106.4,0c30.5,0,61.1,0,91.6,0     c14.9,0,29.9,0.2,44.9,0c0.2,0,0.4,0,0.6,0c12.8,0,26.3-5.6,35.4-14.6c8.7-8.7,15.2-22.9,14.6-35.4c-0.6-12.9-4.8-26.3-14.6-35.4     c-9.8-9-21.8-14.6-35.4-14.6c-12.2,0-24.4,0-36.6,0c-29.3,0-58.7,0-88,0c-35.5,0-71,0-106.4,0c-30.5,0-61.1,0-91.6,0     c-14.9,0-29.9-0.2-44.9,0c-0.2,0-0.4,0-0.6,0c-12.8,0-26.3,5.6-35.4,14.6c-8.7,8.7-15.2,22.9-14.6,35.4     c0.6,12.9,4.8,26.3,14.6,35.4C102.3,818.3,114.3,823.9,127.9,823.9L127.9,823.9z"></path></g></g></g></svg>`,
    textFillColor: `#ffffff`
  },
  newAlert: {
    xml: `<svg height='100px' width='100px'  fill="#57e1f1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><path d="M267.8,374c-10.5-0.4-21.2-0.6-32-0.6c-47.3,0-91.9,3.8-125.4,10.6c-36,7.4-45,15.2-47,17.9   c-0.1,0.4-0.3,0.8-0.5,1.1c0.6,1.3,6.5,10.4,47.6,18.8c33.6,6.9,78.1,10.6,125.4,10.6c13.5,0,26.9-0.3,40-0.9   c-5.9-12.7-9.3-26.9-9.3-41.8C266.5,384.4,267,379.1,267.8,374z"></path><path d="M365.9,306.4c-46,0-83.3,37.4-83.3,83.3S320,473,365.9,473c46,0,83.3-37.4,83.3-83.3   S411.8,306.4,365.9,306.4z M401,399h-28v27c0,4.4-3.6,8-8,8s-8-3.6-8-8v-27h-28c-4.4,0-8-3.6-8-8s3.6-8,8-8h28v-29c0-4.4,3.6-8,8-8   s8,3.6,8,8v29h28c4.4,0,8,3.6,8,8S405.4,399,401,399z"></path><path d="M239,89c9.7,0,19,0.7,29,2.5V70.6c0-17.4-14.6-31.6-32-31.6s-32,14.2-32,31.6v20.9c10-1.9,19.3-2.5,29-2.5   H239z"></path><path d="M235.8,357.4c12.1,0,24.1,0.3,35.9,0.7c13.2-39.3,50.5-67.8,94.2-67.8c1.5,0,3,0,4.5,0.1   c-2.4-9.6-3.4-19.5-3.4-29.5V231c0-1.1-0.2-2.2-0.2-3.3c-0.8-33.1-14.7-64-38.8-87.2c-24.1-23.1-55.7-35.6-89-35.6h-6   c-33.4,0-65.1,12.6-89.1,35.6c-24.1,23.2-37.9,54-38.7,87.1c0,1.1-0.2,2.2-0.2,3.3v29.5c0,13.9-2.2,27.7-6.8,40.9l-26.7,77   c9-3.7,20.6-7,34.7-9.9C140.9,361.3,186.9,357.4,235.8,357.4z"></path></g></svg>`,
    textFillColor: `#57e1f1`
  },
  news: {
    xml: `<svg height='100px' width='100px'  fill="#57e1f1" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="opacity:1;color:#000000;fill:#57e1f1;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:4;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" d="M 27 18 L 27 74.5 C 27 77.359417 25.9142 79.97753 24.15625 82 L 84 82 C 88.7091 82 92 78.7091 92 74 L 92 18 L 27 18 z M 65 28 L 81 28 C 82.108 28 83 28.892 83 30 C 83 31.108 82.108 32 81 32 L 65 32 C 63.892 32 63 31.108 63 30 C 63 28.892 63.892 28 65 28 z M 8 30 L 8 74.5 C 8 78.655 11.345 82 15.5 82 C 19.655 82 23 78.655 23 74.5 L 23 30 L 8 30 z M 38 30 L 54 30 L 54 44 L 38 44 L 38 30 z M 65 42 L 81 42 C 82.108 42 83 42.892 83 44 C 83 45.108 82.108 46 81 46 L 65 46 C 63.892 46 63 45.108 63 44 C 63 42.892 63.892 42 65 42 z M 38 55 L 81 55 C 82.108 55 83 55.892 83 57 C 83 58.108 82.108 59 81 59 L 38 59 C 36.892 59 36 58.108 36 57 C 36 55.892 36.892 55 38 55 z M 38 68 L 81 68 C 82.108 68 83 68.892 83 70 C 83 71.108 82.108 72 81 72 L 38 72 C 36.892 72 36 71.108 36 70 C 36 68.892 36.892 68 38 68 z " transform="translate(0,952.36218)"></path></g></svg>`,
    textFillColor: `#57e1f1`
  },
  newOrder: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M46.3,85.4c-1.1-2.8-1.8-5.9-1.8-9.1c0-13.3,10.8-24.2,24.2-24.2c3.5,0,6.7,0.7,9.7,2.1V25.1H65.3c0-0.1,0-0.3,0-0.4  c0-11-9-20-20-20c-11,0-20,9-20,20c0,0.1,0,0.3,0,0.4H12.3v47.5c0,6.9,6.4,12.8,13.3,12.8H46.3z M45.3,12c7,0,12.6,5.7,12.6,12.6  c0,0.1,0,0.3,0,0.4H32.7c0-0.1,0-0.3,0-0.4C32.7,17.7,38.4,12,45.3,12z M55.2,62.8c-7.4,7.4-7.4,19.5,0,26.9  c7.4,7.4,19.5,7.4,26.9,0c7.4-7.4,7.4-19.5,0-26.9C74.7,55.4,62.7,55.4,55.2,62.8z M76.3,78.5l-5.4,0l0,5.4c0,1.2-1,2.2-2.2,2.2  c-1.2,0-2.2-1-2.2-2.2l0-5.4H61c-1.2,0-2.2-1-2.2-2.2s1-2.2,2.2-2.2h5.4v-5.4c0-1.2,1-2.2,2.2-2.2c1.2,0,2.2,1,2.2,2.2l0,5.4h5.4  c1.2,0,2.2,1,2.2,2.2C78.5,77.5,77.5,78.5,76.3,78.5z"></path></svg>`,
    textFillColor: `#171b29`
  },
  newsTag: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="opacity:1;color:#000000;fill:#171b29;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:4;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" d="M 27 18 L 27 74.5 C 27 77.359417 25.9142 79.97753 24.15625 82 L 84 82 C 88.7091 82 92 78.7091 92 74 L 92 18 L 27 18 z M 65 28 L 81 28 C 82.108 28 83 28.892 83 30 C 83 31.108 82.108 32 81 32 L 65 32 C 63.892 32 63 31.108 63 30 C 63 28.892 63.892 28 65 28 z M 8 30 L 8 74.5 C 8 78.655 11.345 82 15.5 82 C 19.655 82 23 78.655 23 74.5 L 23 30 L 8 30 z M 38 30 L 54 30 L 54 44 L 38 44 L 38 30 z M 65 42 L 81 42 C 82.108 42 83 42.892 83 44 C 83 45.108 82.108 46 81 46 L 65 46 C 63.892 46 63 45.108 63 44 C 63 42.892 63.892 42 65 42 z M 38 55 L 81 55 C 82.108 55 83 55.892 83 57 C 83 58.108 82.108 59 81 59 L 38 59 C 36.892 59 36 58.108 36 57 C 36 55.892 36.892 55 38 55 z M 38 68 L 81 68 C 82.108 68 83 68.892 83 70 C 83 71.108 82.108 72 81 72 L 38 72 C 36.892 72 36 71.108 36 70 C 36 68.892 36.892 68 38 68 z " transform="translate(0,952.36218)"></path></g></svg>`,
    textFillColor: `#171b29`
  },
  noNews: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="opacity:1;color:#000000;fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:4;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" d="M 27 18 L 27 74.5 C 27 77.359417 25.9142 79.97753 24.15625 82 L 84 82 C 88.7091 82 92 78.7091 92 74 L 92 18 L 27 18 z M 65 28 L 81 28 C 82.108 28 83 28.892 83 30 C 83 31.108 82.108 32 81 32 L 65 32 C 63.892 32 63 31.108 63 30 C 63 28.892 63.892 28 65 28 z M 8 30 L 8 74.5 C 8 78.655 11.345 82 15.5 82 C 19.655 82 23 78.655 23 74.5 L 23 30 L 8 30 z M 38 30 L 54 30 L 54 44 L 38 44 L 38 30 z M 65 42 L 81 42 C 82.108 42 83 42.892 83 44 C 83 45.108 82.108 46 81 46 L 65 46 C 63.892 46 63 45.108 63 44 C 63 42.892 63.892 42 65 42 z M 38 55 L 81 55 C 82.108 55 83 55.892 83 57 C 83 58.108 82.108 59 81 59 L 38 59 C 36.892 59 36 58.108 36 57 C 36 55.892 36.892 55 38 55 z M 38 68 L 81 68 C 82.108 68 83 68.892 83 70 C 83 71.108 82.108 72 81 72 L 38 72 C 36.892 72 36 71.108 36 70 C 36 68.892 36.892 68 38 68 z " transform="translate(0,952.36218)"></path></g></svg>`,
    textFillColor: `#ffffff`
  },
  notFavStar: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="none" d="M60.382,38.757L50.056,12.502L39.624,38.714c-0.208,0.523-0.699,0.878-1.261,0.912l-28.161,1.709   l21.707,18.022c0.433,0.359,0.619,0.937,0.478,1.481l-7.078,27.309l23.848-15.075c0.237-0.15,0.506-0.225,0.775-0.225   c0.271,0,0.542,0.076,0.781,0.228l23.786,15.171L67.53,60.908c-0.139-0.544,0.05-1.121,0.484-1.479l21.779-17.933L61.64,39.674   C61.078,39.637,60.588,39.28,60.382,38.757z"></path><path d="M94.93,39.838c-0.183-0.566-0.694-0.964-1.288-1.003l-30.895-1.999L51.415,8.025c-0.218-0.555-0.752-0.92-1.348-0.92   c-0.001,0-0.002,0-0.003,0c-0.594,0-1.129,0.362-1.349,0.915L37.267,36.784L6.364,38.659c-0.594,0.036-1.107,0.431-1.292,0.997   c-0.185,0.566-0.006,1.188,0.453,1.569l23.82,19.777l-7.767,29.969c-0.149,0.576,0.069,1.185,0.55,1.537   c0.482,0.351,1.128,0.373,1.631,0.054l26.17-16.543l26.102,16.649c0.239,0.152,0.51,0.228,0.781,0.228   c0.299,0,0.598-0.093,0.851-0.276c0.482-0.349,0.703-0.957,0.556-1.534l-7.646-30.001l23.9-19.68   C94.931,41.026,95.113,40.405,94.93,39.838z M68.014,59.429c-0.434,0.358-0.623,0.935-0.484,1.479l6.968,27.339L50.712,73.075   c-0.238-0.152-0.509-0.228-0.781-0.228c-0.269,0-0.539,0.075-0.775,0.225L25.308,88.147l7.078-27.309   c0.141-0.544-0.045-1.122-0.478-1.481L10.202,41.335l28.161-1.709c0.561-0.034,1.053-0.389,1.261-0.912l10.432-26.212   l10.326,26.255c0.206,0.524,0.696,0.881,1.257,0.918l28.153,1.821L68.014,59.429z"></path></g></svg>`,
    textFillColor: `#ffffff`
  },
  searchSymbol: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" data-name="Layer 2" viewBox="0 0 50 50" x="0px" y="0px"><title>Artboard 24</title><path d="M40.5562,9.4438A22,22,0,1,0,9.4438,40.5562,22,22,0,1,0,40.5562,9.4438ZM39,26H26V39a1,1,0,0,1-2,0V26H11a1,1,0,0,1,0-2H24V11a1,1,0,0,1,2,0V24H39a1,1,0,0,1,0,2Z"></path></svg>`,
    textFillColor: `#171b29`
  },
  // search: {
  //     xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M31.2,26.9c-1.2-1.2-3.1-1.2-4.2,0c-4.1,4.1-6.4,9.6-6.4,15.5c0,5.8,2.3,11.3,6.4,15.5c0.6,0.6,1.4,0.9,2.1,0.9  s1.5-0.3,2.1-0.9c1.2-1.2,1.2-3.1,0-4.2c-3-3-4.7-7-4.7-11.2s1.7-8.2,4.7-11.2C32.3,30,32.3,28.1,31.2,26.9z"></path><path d="M88,83.8L66.6,62.3c2-2.5,3.7-5.2,4.9-8.1c1.5-3.8,2.3-7.7,2.3-11.8s-0.8-8-2.3-11.8c-1.6-3.9-3.9-7.4-6.9-10.4  c-3-3-6.5-5.3-10.4-6.9c-3.8-1.5-7.7-2.3-11.8-2.3s-8,0.8-11.8,2.3c-3.9,1.6-7.4,3.9-10.4,6.9s-5.3,6.5-6.9,10.4  c-1.5,3.8-2.3,7.7-2.3,11.8s0.8,8,2.3,11.8c1.6,3.9,3.9,7.4,6.9,10.4s6.5,5.3,10.4,6.9c3.8,1.5,7.7,2.3,11.8,2.3s8-0.8,11.8-2.3  c3-1.2,5.7-2.8,8.1-4.9L83.8,88c0.6,0.6,1.4,0.9,2.1,0.9c0.8,0,1.5-0.3,2.1-0.9C89.2,86.9,89.2,85,88,83.8z M42.4,67.7  c-6.8,0-13.1-2.6-17.9-7.4c-9.9-9.9-9.9-25.9,0-35.8c4.9-4.9,11.4-7.4,17.9-7.4c6.5,0,13,2.5,17.9,7.4c9.9,9.9,9.9,25.9,0,35.8  C55.5,65.1,49.2,67.7,42.4,67.7z"></path></svg>`,
  //     textFillColor: `#ffffff`
  // },
  sensitiveNews: {
    xml: `<svg height='100px' width='100px'  fill="#57e1f1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M93.861,50C93.861,25.776,74.224,6.139,50,6.139S6.139,25.776,6.139,50S25.776,93.861,50,93.861S93.861,74.224,93.861,50z   M48.325,16.863c3.537-0.883,7.077,0.825,8.596,4.156c0.538,1.18,0.701,2.426,0.623,3.715c-0.222,3.683-0.437,7.366-0.649,11.049  c-0.331,5.754-0.662,11.509-0.983,17.263c-0.1,1.784-0.172,3.57-0.249,5.355c-0.134,3.119-2.461,5.421-5.493,5.428  c-2.962,0.007-5.334-2.266-5.491-5.235c-0.472-8.893-0.95-17.785-1.435-26.677c-0.13-2.389-0.29-4.776-0.445-7.164  C42.558,21.022,44.862,17.727,48.325,16.863z M50.137,83.722c-4.072-0.035-7.368-3.356-7.353-7.409  c0.015-4.112,3.332-7.392,7.462-7.377c4.063,0.014,7.363,3.407,7.323,7.529C57.53,80.42,54.113,83.756,50.137,83.722z"></path></svg>`,
    textFillColor: `#57e1f1`
  },
  shareArticle: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 18 22" version="1.1" x="0px" y="0px"><title>Group</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, -1.000000)" fill="#ffffff"><path d="M5,8 L1.99508929,8 C0.892622799,8 0,8.89179693 0,9.99188419 L0,21.0081158 C0,22.1066027 0.893231902,23 1.99508929,23 L16.0049107,23 C17.1073772,23 18,22.1082031 18,21.0081158 L18,9.99188419 C18,8.89339733 17.1067681,8 16.0049107,8 L13,8 L13,9.5 L16.5,9.5 L16.5,21.5 L1.5,21.5 L1.5,9.5 L5,9.5 L5,8 Z"></path><rect x="8.25" y="2" width="1.5" height="13" rx="0.75"></rect><rect transform="translate(7.409010, 3.409010) rotate(45.000000) translate(-7.409010, -3.409010) " x="6.65901" y="0.409009634" width="1.5" height="6" rx="0.75"></rect><rect transform="translate(10.590990, 3.409010) rotate(135.000000) translate(-10.590990, -3.409010) " x="9.84099" y="0.409010366" width="1.5" height="6" rx="0.75"></rect></g></g></svg>`,
    textFillColor: `#ffffff`
  },
  sort: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve"><g><path fill="#ffffff" d="M3.6,6H2.4C2.2,6,2,6.2,2,6.4V15H0.4c-0.3,0-0.5,0.4-0.3,0.7l3.2,4.2C3.5,20.2,4,20,4,19.6L4,6.4   C4,6.2,3.8,6,3.6,6z"></path><path fill="#ffffff" d="M19.9,4.3l-3.2-4.2C16.5-0.2,16,0,16,0.4l0,13.2c0,0.2,0.2,0.4,0.4,0.4h1.2c0.2,0,0.4-0.2,0.4-0.4V5l1.6,0   C20,5,20.2,4.6,19.9,4.3z"></path><path fill="#ffffff" d="M13.6,15H6.4C6.2,15,6,15.2,6,15.4v1.2C6,16.8,6.2,17,6.4,17h7.2c0.2,0,0.4-0.2,0.4-0.4v-1.2   C14,15.2,13.8,15,13.6,15z"></path><path fill="#ffffff" d="M13.6,11H6.4C6.2,11,6,11.2,6,11.4v1.2C6,12.8,6.2,13,6.4,13h7.2c0.2,0,0.4-0.2,0.4-0.4v-1.2   C14,11.2,13.8,11,13.6,11z"></path><path fill="#ffffff" d="M13.6,7H6.4C6.2,7,6,7.2,6,7.4v1.2C6,8.8,6.2,9,6.4,9h7.2C13.8,9,14,8.8,14,8.6V7.4C14,7.2,13.8,7,13.6,7z"></path><path fill="#ffffff" d="M13.6,3H6.4C6.2,3,6,3.2,6,3.4v1.2C6,4.8,6.2,5,6.4,5h7.2C13.8,5,14,4.8,14,4.6V3.4C14,3.2,13.8,3,13.6,3z"></path></g></svg>`,
    textFillColor: `#ffffff`
  },
  sourceFilter: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path display="none" d="M69.172,11.265c-0.191-0.192-0.502-0.192-0.695,0L11.639,68.029c-0.192,0.191-0.192,0.501,0,0.692  l19.207,19.184c0.096,0.095,0.222,0.143,0.348,0.143c0.125,0,0.251-0.048,0.347-0.143L88.38,31.14  c0.093-0.092,0.145-0.216,0.145-0.347s-0.052-0.255-0.145-0.347L69.172,11.265z"></path><path display="none" d="M96.846,9.12l-6.319-6.311C88.713,0.998,86.301,0,83.735,0c-2.564,0-4.977,0.998-6.79,2.809L70.626,9.12  c-0.093,0.092-0.145,0.216-0.145,0.347c0,0.13,0.052,0.254,0.145,0.346l19.207,19.182c0.092,0.092,0.218,0.144,0.348,0.144  c0.131,0,0.255-0.052,0.346-0.144l6.319-6.311c1.814-1.812,2.813-4.22,2.813-6.783C99.659,13.34,98.66,10.932,96.846,9.12z"></path><path display="none" d="M10.358,69.967c-0.122-0.121-0.296-0.172-0.464-0.129c-0.167,0.04-0.3,0.165-0.351,0.33l-9.18,29.195  c-0.055,0.178-0.006,0.369,0.127,0.498C0.584,99.952,0.707,100,0.832,100c0.054,0,0.11-0.011,0.164-0.029l28.387-10.012  c0.159-0.056,0.278-0.188,0.315-0.354c0.037-0.164-0.012-0.337-0.132-0.455L10.358,69.967z"></path></svg>`,
    textFillColor: `#ffffff`
  },
  tradingHaltTag: {
    xml: `<svg height='100px' width='100px'  fill="#fd3754" xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-205 207 100 100" style="enable-background:new -205 207 100 100;" xml:space="preserve"><g><g i:extraneous="self"><path d="M-124,226c-17.1-17.1-44.8-17.1-62,0c-17.1,17.1-17.1,44.8,0,62c17.1,17.1,44.8,17.1,62,0    C-106.9,270.9-106.9,243.1-124,226z M-129.6,259.9c-1.2,2.2-3.1,3.2-5.5,3.2c-4.2,0-8.4,0-12.5,0h-2.8l0,0H-168l0,0    c-2.1,0-4.2,0-6.3,0c-1.6,0-3.1-0.3-4.4-1.2c-2-1.5-2.9-4.1-2.2-6.6c0.7-2.4,2.8-4.3,5.2-4.4c3-0.1,6.1-0.1,9.1-0.1    c3.4,0,6.7,0,10.1,0c0.2,0,0.3,0,0.4,0h4.3l0,0c1.4,0,2.8,0,4.2,0h4.3c2.8,0,5.6,0,8.4,0C-130.3,250.9-127.3,255.9-129.6,259.9z"></path></g></g></svg>`,
    textFillColor: `#fd3754`
  },
  done: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#ffffff"
            viewBox="0 0 100 100"
        >
            <path d="M69.437 43.303l-24.12 25.753c-.817.871-1.851 1.307-2.995 1.307s-2.232-.436-2.995-1.307L27.241 56.152a4.063 4.063 0 01.218-5.771c1.633-1.525 4.192-1.416 5.771.218l9.093 9.691 21.18-22.595c1.524-1.633 4.138-1.742 5.771-.163 1.633 1.524 1.742 4.083.163 5.771z"></path>
            <path d="M5.082 50C5.082 25.227 25.172 5.136 50 5.082 74.773 5.136 94.918 25.227 94.918 50c0 24.828-20.145 44.918-44.918 44.918-24.828 0-44.918-20.09-44.918-44.918zm18.893 26.025C30.672 82.668 39.819 86.751 50 86.751c10.127 0 19.328-4.083 25.971-10.726 6.642-6.697 10.78-15.844 10.78-26.025 0-10.127-4.138-19.274-10.78-25.971-6.643-6.642-15.844-10.78-25.971-10.78-10.181 0-19.328 4.138-26.025 10.78C17.332 30.726 13.249 39.873 13.249 50c0 10.181 4.083 19.328 10.726 26.025z"></path>
        </svg>`,
    textFillColor: `#ffffff`
  },
  search: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#fff"
            enableBackground="new 0 0 100 100"
            viewBox="0 0 100 100"
        >
            <path d="M31.2 26.9c-1.2-1.2-3.1-1.2-4.2 0-4.1 4.1-6.4 9.6-6.4 15.5 0 5.8 2.3 11.3 6.4 15.5.6.6 1.4.9 2.1.9s1.5-.3 2.1-.9c1.2-1.2 1.2-3.1 0-4.2-3-3-4.7-7-4.7-11.2s1.7-8.2 4.7-11.2c1.1-1.3 1.1-3.2 0-4.4z"></path>
            <path d="M88 83.8L66.6 62.3c2-2.5 3.7-5.2 4.9-8.1 1.5-3.8 2.3-7.7 2.3-11.8s-.8-8-2.3-11.8c-1.6-3.9-3.9-7.4-6.9-10.4-3-3-6.5-5.3-10.4-6.9-3.8-1.5-7.7-2.3-11.8-2.3s-8 .8-11.8 2.3c-3.9 1.6-7.4 3.9-10.4 6.9s-5.3 6.5-6.9 10.4c-1.5 3.8-2.3 7.7-2.3 11.8s.8 8 2.3 11.8c1.6 3.9 3.9 7.4 6.9 10.4s6.5 5.3 10.4 6.9c3.8 1.5 7.7 2.3 11.8 2.3s8-.8 11.8-2.3c3-1.2 5.7-2.8 8.1-4.9L83.8 88c.6.6 1.4.9 2.1.9.8 0 1.5-.3 2.1-.9 1.2-1.1 1.2-3 0-4.2zM42.4 67.7c-6.8 0-13.1-2.6-17.9-7.4-9.9-9.9-9.9-25.9 0-35.8 4.9-4.9 11.4-7.4 17.9-7.4 6.5 0 13 2.5 17.9 7.4 9.9 9.9 9.9 25.9 0 35.8-4.8 4.8-11.1 7.4-17.9 7.4z"></path>
        </svg>`,
    textFillColor: `#ffffff`
  },
  pendingState: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#171b29"
            enableBackground="new 0 0 100 100"
            viewBox="0 0 100 100"
          >
            <path d="M5273.1 2400.1v-2c0-2.8-5-4-9.7-4s-9.7 1.3-9.7 4v2c0 1.8.7 3.6 2 4.9l5 4.9c.3.3.4.6.4 1v6.4c0 .4.2.7.6.8l2.9.9c.5.1 1-.2 1-.8v-7.2c0-.4.2-.7.4-1l5.1-5c1.3-1.3 2-3.1 2-4.9zm-9.7-.1c-4.8 0-7.4-1.3-7.5-1.8.1-.5 2.7-1.8 7.5-1.8s7.3 1.3 7.5 1.8c-.2.5-2.7 1.8-7.5 1.8z"></path>
            <path d="M5268.4 2410.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1s-.4-1-1-1h-4.3zM5272.7 2413.7h-4.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1s-.4-1-1-1zM5272.7 2417h-4.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1 0-.5-.4-1-1-1z"></path>
            <g>
              <path d="M91.7 11.3c-.5-2.2-3.3-3-4.9-1.4l-5 5C63.1-1.9 34.4-1.4 16.4 16.5c-18.6 18.6-18.6 48.8 0 67.4.6.6 1.2 1.1 1.7 1.7 1 .9 2.2 1.3 3.4 1.3 1.4 0 2.8-.6 3.8-1.7 1.9-2.1 1.7-5.3-.4-7.2l-1.4-1.3C9 62.1 9 38.3 23.6 23.7c14-14 36.3-14.4 51-1.6l-5.5 5.5c-1.6 1.6-.8 4.4 1.4 4.9l23.4 5.7c2.1.5 4.1-1.4 3.6-3.6l-5.8-23.3z"></path>
              <path d="M66.8 54.8l-11.7-7.4V28.7c0-2.8-2.3-5.1-5.1-5.1s-5.1 2.3-5.1 5.1v21.4c0 1.7.9 3.4 2.4 4.3l14 8.9c.8.5 1.8.8 2.7.8 1.7 0 3.3-.8 4.3-2.4 1.6-2.3.9-5.4-1.5-6.9zM40.3 86.3l-1.9-.6c-2.7-.9-5.6.6-6.4 3.2-.9 2.7.6 5.6 3.2 6.4.8.3 1.6.5 2.4.7.4.1.9.2 1.3.2 2.2 0 4.3-1.5 4.9-3.8.8-2.6-.8-5.4-3.5-6.1zM57.6 86.8l-2 .3c-2.8.4-4.7 3-4.3 5.8.4 2.5 2.6 4.4 5 4.4.2 0 .5 0 .8-.1.8-.1 1.7-.3 2.5-.4 2.8-.6 4.5-3.2 4-6-.6-2.7-3.3-4.5-6-4zM73.2 79.6l-1.6 1.2c-2.3 1.6-2.8 4.8-1.2 7.1 1 1.4 2.6 2.2 4.2 2.2 1 0 2-.3 2.9-.9.7-.5 1.4-1 2-1.5 2.2-1.7 2.6-5 .8-7.2-1.6-2.3-4.9-2.6-7.1-.9z"></path>
            </g>
          </svg>`,
    textFillColor: `#171b29`
  },
  rowSelected: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="13"
            fill="#171b29"
            viewBox="0 0 12 13"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="#57E1F1" strokeWidth="2" transform="translate(-340 -277)">
                <path d="M341 282.583293L345.771737 288 351 278"></path>
            </g>
            </g>
        </svg>`,
    textFillColor: `#57E1F1`
  },
  rowSelectedBlack: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="13"
            fill="#171b29"
            viewBox="0 0 12 13"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="#000000" strokeWidth="2" transform="translate(-340 -277)">
                <path d="M341 282.583293L345.771737 288 351 278"></path>
            </g>
            </g>
        </svg>`,
    textFillColor: `#000000`
  },
  warning: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#171b29"
            viewBox="0 0 32 32"
        >
            <path d="M28.359 23.597L17.575 6.147c-.869-1.403-2.281-1.406-3.15 0L3.641 23.597C2.475 25.481 3.322 27 5.529 27h20.944c2.203 0 3.05-1.522 1.887-3.403zM16 24a1 1 0 110-2 1 1 0 110 2zm1-4.997c0 .544-.447.997-1 .997-.556 0-1-.447-1-.997v-6.006c0-.544.447-.997 1-.997.556 0 1 .447 1 .997v6.006z"></path>
        </svg>`,
    textFillColor: `#171b29`
  },
  x: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#171b29"
            data-name="Layer 1"
            viewBox="0 0 100 100"
        >
            <path d="M93.243 6.757a6 6 0 00-8.486 0L50 41.515 15.243 6.757a6 6 0 00-8.486 8.486L41.515 50 6.757 84.757a6 6 0 008.486 8.486L50 58.485l34.757 34.758a6 6 0 008.486-8.486L58.485 50l34.758-34.757a6 6 0 000-8.486z"></path>
        </svg>`,
    textFillColor: `#171b29`
  },
  setting: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#ffffff"
            enableBackground="new 0 0 100 100"
            viewBox="0 0 100 100"
        >
            <path d="M93 40h-5c-1.9 0-3.5-1.2-4.2-3-.2-.6-.5-1.2-.7-1.7-.8-1.7-.5-3.8.9-5.1l3.6-3.6c1.8-1.8 1.8-4.6 0-6.4l-7.8-7.8c-1.8-1.8-4.6-1.8-6.4 0L69.8 16c-1.3 1.3-3.4 1.7-5.1.9-.6-.2-1.1-.5-1.7-.7-1.8-.7-3-2.3-3-4.2V7c0-2.5-2-4.5-4.5-4.5h-11C42 2.5 40 4.5 40 7v5.1c0 1.9-1.2 3.6-3 4.2-.6.2-1.1.4-1.7.7-1.7.8-3.7.4-5.1-.9l-3.6-3.6c-1.8-1.8-4.6-1.8-6.4 0l-7.8 7.8c-1.8 1.8-1.8 4.6 0 6.4l3.6 3.6c1.3 1.3 1.7 3.4.9 5.1-.3.6-.5 1.1-.7 1.7-.7 1.8-2.3 3-4.2 3H7c-2.5 0-4.5 2-4.5 4.5v11C2.5 58 4.5 60 7 60h4.9c1.9 0 3.6 1.2 4.2 3 .2.6.5 1.2.7 1.8.8 1.7.4 3.7-.9 5.1l-3.5 3.5c-1.8 1.8-1.8 4.6 0 6.4l7.8 7.8c1.8 1.8 4.6 1.8 6.4 0l3.4-3.4c1.3-1.3 3.3-1.7 5-.9.7.3 1.4.6 2 .9 1.7.7 2.9 2.3 2.9 4.2V93c0 2.5 2 4.5 4.5 4.5h11c2.5 0 4.5-2 4.5-4.5v-4.9c0-1.8 1.1-3.5 2.9-4.2.7-.3 1.4-.5 2-.9 1.7-.8 3.7-.4 5 .9l3.4 3.4c1.8 1.8 4.6 1.8 6.4 0l7.8-7.8c1.8-1.8 1.8-4.6 0-6.4L84 69.8c-1.3-1.3-1.7-3.3-.9-5.1.3-.6.5-1.2.7-1.8.7-1.8 2.3-3 4.2-3h5c2.5 0 4.5-2 4.5-4.5v-11c0-2.4-2-4.4-4.5-4.4zM50 67.5c-9.7 0-17.5-7.8-17.5-17.5S40.3 32.5 50 32.5 67.5 40.3 67.5 50 59.7 67.5 50 67.5z"></path>
        </svg>`,
    textFillColor: `#ffffff`
  },
  tickRounded: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="#57E1F1" transform="translate(-8 -451)">
                <g transform="translate(8 451)">
                <path strokeWidth="2" d="M8 11.6666345L11.8173899 16 16 8"></path>
                <circle cx="12" cy="12" r="11.5"></circle>
                </g>
            </g>
            </g>
        </svg>`,
    textFillColor: `none`
  },
  untickRounded: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="#3A425E" transform="translate(-326 -167)">
                <g transform="translate(8 153)">
                <circle cx="331" cy="27" r="12"></circle>
                </g>
            </g>
            </g>
        </svg>`,
    textFillColor: `none`
  },
  selectedRounded: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="13"
            viewBox="0 0 12 13"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="${CommonStyle ? CommonStyle.fontBlue1 : 'none'}" strokeWidth="2" transform="translate(-340 -277)">
                <path d="M341 282.583293L345.771737 288 351 278"></path>
            </g>
            </g>
        </svg>`,
    textFillColor: `none`
  },
  triggerState: {
    xml: `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          x="0"
          y="0"
          fill="${CommonStyle ? CommonStyle.fontBlue1 : 'none'}"
          viewBox="-53.24 -51.863 1024 1024"
        >
          <path d="M340.379 85.038h373.837l-24.177-42.132-46.853 87.026-91.334 169.651a6473315.018 6473315.018 0 00-64.367 119.56c-9.964 18.507 2.389 42.132 24.177 42.132h202.553l-19.799-47.799-52.789 46.116L516.242 569.13a19703299.475 19703299.475 0 00-317.3 277.196l46.799 27.242 29.941-88.922 60.931-180.955 48.578-144.27 6.298-18.703c5.868-17.429-9.572-35.443-27-35.443H216.476l27 35.443 32.586-98.951 60.115-182.541 31.202-94.745c4.775-14.5-5.396-30.548-19.557-34.443-15.266-4.199-29.673 5.073-34.443 19.557l-32.586 98.951-60.115 182.541-31.202 94.745c-5.746 17.448 9.48 35.443 27 35.443h148.013l-27-35.443-29.941 88.922-60.931 180.955-48.578 144.27-6.298 18.703c-3.979 11.815 2.498 25.546 12.868 31.62 11.417 6.688 24.376 3.97 33.931-4.378l52.789-46.116L416.715 730.27A19703299.477 19703299.477 0 01687.398 493.8l46.617-40.726c7.377-6.444 9.712-18.113 7.201-27.242-3.304-12.011-14.548-20.557-27-20.557H511.663l24.177 42.132 46.853-87.026 91.335-169.651 61.986-115.139 2.38-4.421c9.964-18.507-2.388-42.132-24.177-42.132H340.38c-15.263 0-28 12.737-28 28s12.736 28 27.999 28z"></path>
        </svg>`,
    textFillColor: `#171b29`
  },
  marketClosed: {
    xml: `<svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Oval</title>
    <g id="Security-Detail" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" opacity="0.504789807">
        <g id="IRESS-Security-Detail-(Market-Close)" transform="translate(-349.000000, -193.000000)" stroke="#FFFFFF" stroke-width="2.5">
            <circle id="Oval" cx="354" cy="198" r="3.75"></circle>
        </g>
    </g>
</svg>`,
    textFillColor: '#FFFFFF'
  },
  noun_Book: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 399 289" version="1.1" x="0px" y="0px">
    <title>Education-02</title>
    <desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-rule="nonzero">` +
    `<path d="M199.46,258.93 C198.657557,258.929789 197.862811,258.773557 197.12,258.47 C143.47,236.47 89.07,236.47 35.42,258.47 C33.5179487,259.245717 31.3545779,259.023974 29.6494437,257.878525 C27.9443095,256.733076 26.9210462,254.814151 26.92,252.76 L26.92,35.54 C26.9189908,33.5205463 27.9094747,31.6292825 29.57,30.48 C87.1,-9.46 145.45,-9.46 202.98,30.48 C204.640525,31.6292825 205.631009,33.5205463 205.63,35.54 L205.63,252.76 C205.63,256.167597 202.867597,258.93 199.46,258.93 Z M116.27,229.64 C142.57017,229.74155 168.642724,234.51926 193.27,243.75 L193.27,38.75 C141.47,3.95 91.02,3.95 39.27,38.75 L39.27,243.75 C63.897276,234.51926 89.9698296,229.74155 116.27,229.64 Z"></path><path d="M365.84,258.93 C365.037557,258.929789 364.242811,258.773557 363.5,258.47 C309.85,236.47 255.45,236.47 201.8,258.47 C199.897949,259.245717 197.734578,259.023974 196.029444,257.878525 C194.32431,256.733076 193.301046,254.814151 193.3,252.76 L193.3,35.54 C193.298991,33.5205463 194.289475,31.6292825 195.95,30.48 C253.48,-9.46 311.83,-9.46 369.36,30.48 C371.020525,31.6292825 372.011009,33.5205463 372.01,35.54 L372.01,252.76 C372.01,256.167597 369.247597,258.93 365.84,258.93 Z M282.65,229.64 C308.95017,229.74155 335.022724,234.51926 359.65,243.75 L359.65,38.75 C307.85,3.95 257.4,3.95 205.65,38.75 L205.65,243.75 C230.277276,234.51926 256.34983,229.74155 282.65,229.64 Z"></path><path d="M206.86,288.4 L192.06,288.4 C182.814568,288.383497 174.142432,283.917161 168.76,276.4 L7,276.4 C5.36280026,276.40266 3.79189066,275.753462 2.6342141,274.595786 C1.47653753,273.438109 0.827340044,271.8672 0.83,270.23 L0.83,35.06 C0.829997845,33.4245323 1.48036851,31.8561949 2.63775633,30.7006829 C3.79514414,29.5451709 5.36453449,28.897345 7,28.9 L33.13,28.9 C35.3917677,28.8088893 37.5218325,29.9635981 38.6798394,31.9085697 C39.8378462,33.8535413 39.8378462,36.2764587 38.6798394,38.2214303 C37.5218325,40.1664019 35.3917677,41.3211107 33.13,41.23 L13.13,41.23 L13.13,264.07 L172.13,264.07 C174.397303,264.072158 176.481381,265.315696 177.56,267.31 C180.400961,272.672984 185.961087,276.039032 192.03,276.07 L206.83,276.07 C212.898913,276.039032 218.459039,272.672984 221.3,267.31 C222.378619,265.315696 224.462697,264.072158 226.73,264.07 L385.73,264.07 L385.73,41.23 L365.73,41.23 C363.468232,41.3211107 361.338167,40.1664019 360.180161,38.2214303 C359.022154,36.2764587 359.022154,33.8535413 360.180161,31.9085697 C361.338167,29.9635981 363.468232,28.8088893 365.73,28.9 L392,28.9 C393.6372,28.89734 395.208109,29.5465375 396.365786,30.7042141 C397.523462,31.8618907 398.17266,33.4328003 398.17,35.07 L398.17,270.24 C398.170002,271.875468 397.519631,273.443805 396.362244,274.599317 C395.204856,275.754829 393.635466,276.402655 392,276.4 L230.17,276.4 C224.785511,283.920023 216.108962,288.386715 206.86,288.4 Z"></path></g></g></svg>`,
    textFillColor: '#ffffff'
  },
  noun_push: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" x="0px" y="0px">
        <title>plus-circle</title>
        <path d="M8 14.857c-0.005 0-0.010 0-0.016 0-0.631 0-1.143 0.511-1.143 1.143s0.511 1.143 1.143 1.143c0.006 0 0.011 0 0.017 0h15.998c0.005 0 0.010 0 0.016 0 0.631 0 1.143-0.511 1.143-1.143s-0.511-1.143-1.143-1.143c-0.006 0-0.011 0-0.017 0z"></path><path d="M17.143 8c0-0.005 0-0.010 0-0.016 0-0.631-0.511-1.143-1.143-1.143s-1.143 0.511-1.143 1.143c0 0.006 0 0.011 0 0.017v-0.001 15.999c0 0.005 0 0.010 0 0.016 0 0.631 0.511 1.143 1.143 1.143s1.143-0.511 1.143-1.143c0-0.006 0-0.011 0-0.017v0.001z"></path><path d="M16 0c-8.823 0-15.999 7.177-15.999 15.999s7.177 15.999 15.999 15.999c8.823 0 15.999-7.177 15.999-15.999s-7.177-15.999-15.999-15.999zM16 2.286c7.588 0 13.714 6.127 13.714 13.714s-6.126 13.714-13.714 13.714c-7.588 0-13.714-6.126-13.714-13.714s6.126-13.714 13.714-13.714z"></path></svg>`,
    textFillColor: '#ffffff'
  },
  noun_menu: {
    xml: `<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="16px" height="16px" viewBox="0 0 16 16" id="svg2" version="1.1" inkscape:version="0.91 r13725" sodipodi:docname="38 - menu bar lines option list hamburger web.svg">
        <defs id="defs4">
          <pattern y="0" x="0" height="6" width="6" patternUnits="userSpaceOnUse" id="EMFhbasepattern"/>
          <pattern y="0" x="0" height="6" width="6" patternUnits="userSpaceOnUse" id="EMFhbasepattern-4"/>
          <pattern y="0" x="0" height="6" width="6" patternUnits="userSpaceOnUse" id="EMFhbasepattern-3"/>
          <pattern y="0" x="0" height="6" width="6" patternUnits="userSpaceOnUse" id="EMFhbasepattern-8"/>
        </defs>
        <sodipodi:namedview id="base" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:zoom="22.627417" inkscape:cx="6.2316889" inkscape:cy="7.4271635" inkscape:document-units="px" inkscape:current-layer="g5228" showgrid="true" units="px" inkscape:window-width="1366" inkscape:window-height="705" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:snap-bbox="true" inkscape:bbox-paths="true" inkscape:bbox-nodes="true" inkscape:snap-bbox-edge-midpoints="true" inkscape:snap-bbox-midpoints="true" inkscape:snap-global="true">
          <inkscape:grid type="xygrid" id="grid3336"/>
        </sodipodi:namedview>
        
        <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(0,-1036.3622)">
          <g transform="translate(628,-140.49998)" id="g5228">
            <path style="color:#ffffff;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#ffffff;solid-opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate" d="M 4.484375 4 A 0.50005 0.50005 0 0 0 4.5351562 5 L 11.464844 5 A 0.50005 0.50005 0 1 0 11.464844 4 L 4.5351562 4 A 0.50005 0.50005 0 0 0 4.484375 4 z M 4.484375 7 A 0.50005 0.50005 0 0 0 4.5351562 8 L 11.464844 8 A 0.50005 0.50005 0 1 0 11.464844 7 L 4.5351562 7 A 0.50005 0.50005 0 0 0 4.484375 7 z M 4.484375 10 A 0.50005 0.50005 0 0 0 4.5351562 11 L 11.464844 11 A 0.50005 0.50005 0 1 0 11.464844 10 L 4.5351562 10 A 0.50005 0.50005 0 0 0 4.484375 10 z " transform="translate(-628,1176.8622)" id="path3340"/>
          </g>
        </g>
      
          
          
          
          <metadata>
              <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:dc="http://purl.org/dc/elements/1.1/">
                  <rdf:Description about="https://iconscout.com/legal#licenses" dc:title="Menu, Bar, Lines, Option, List, Hamburger, Web" dc:description="Menu, Bar, Lines, Option, List, Hamburger, Web" dc:publisher="Iconscout" dc:date="2016-12-14" dc:format="image/svg+xml" dc:language="en">
                      <dc:creator>
                          <rdf:Bag>
                              <rdf:li>Jemis Mali</rdf:li>
                          </rdf:Bag>
                      </dc:creator>
                  </rdf:Description>
              </rdf:RDF>
          </metadata></svg>
      `,
    textFillColor: '#ffffff'
  },
  delayed: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 125" x="0px" y="0px">
        <title>restore</title>
        <path d="M23.45,76.58A37.52,37.52,0,1,0,25.1,22l5.66-.81a2.5,2.5,0,1,1,.71,4.95L18.26,28l-.35,0a2.49,2.49,0,0,1-2.47-2.85L17.32,12a2.5,2.5,0,1,1,4.95.71l-.84,5.87a42.5,42.5,0,1,1-1.51,61.57,2.5,2.5,0,0,1,3.53-3.53ZM50,24.74a2.5,2.5,0,0,0-2.5,2.5V50a2.49,2.49,0,0,0,.73,1.77L62.44,66A2.5,2.5,0,1,0,66,62.45L52.49,49V27.24A2.5,2.5,0,0,0,50,24.74Z">
        </path>
        </svg>`,
    textFillColor: '#ffffff'
  },
  payPerview: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 60" x="0px" y="0px">
        <path d="M24,46C11.9,46,2,36.1,2,24C2,11.9,11.9,2,24,2c12.1,0,22,9.9,22,22c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1C48,10.8,37.2,0,24,0   S0,10.8,0,24s10.8,24,24,24c0.6,0,1-0.4,1-1C25,46.4,24.6,46,24,46z"/><path d="M24,41c-9.4,0-17-7.6-17-17c0-9.4,7.6-17,17-17s17,7.6,17,17c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1c0-10.5-8.5-19-19-19   C13.5,5,5,13.5,5,24c0,10.5,8.5,19,19,19c0.6,0,1-0.4,1-1C25,41.4,24.6,41,24,41z"/><path d="M24,16.4c1.8,0,3.3,1.5,3.3,3.3c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1c0-2.6-1.9-4.7-4.3-5.2v-1.1c0-0.6-0.4-1-1-1   c-0.6,0-1,0.4-1,1v1.1c-2.4,0.5-4.3,2.6-4.3,5.2c0,2.9,2.4,5.3,5.3,5.3c1.8,0,3.3,1.5,3.3,3.3c0,1.8-1.5,3.3-3.3,3.3   c-1.8,0-3.3-1.5-3.3-3.3c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1c0,2.6,1.9,4.7,4.3,5.2v1.1c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1v-1.1   c2.4-0.5,4.3-2.6,4.3-5.2c0-2.9-2.4-5.3-5.3-5.3c-1.8,0-3.3-1.5-3.3-3.3S22.2,16.4,24,16.4z"/><path d="M40.9,39.5l3.5-3.5c0.2-0.2,0.3-0.6,0.3-0.9c-0.1-0.3-0.3-0.6-0.7-0.7l-12.7-4.2c-0.4-0.1-0.8,0-1,0.2   c-0.3,0.3-0.4,0.7-0.2,1l4.2,12.7c0.1,0.3,0.4,0.6,0.7,0.7c0.1,0,0.2,0,0.2,0c0.3,0,0.5-0.1,0.7-0.3l3.5-3.5l6.8,6.8   c0.2,0.2,0.5,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L40.9,39.5z M35.7,41.9l-3.1-9.3l9.3,3.1L35.7,41.9z">
        </path>
        </svg>`,
    textFillColor: '#ffffff'
  },
  noun_tick: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 7.1628 7.1628" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs><style type="text/css">
        .fil0 {fill:#171b29;fill-rule:nonzero}
        </style></defs><g><path class="fil0" d="M3.5814 0c-1.9781,0 -3.5814,1.6033 -3.5814,3.5814 0,1.9781 1.6033,3.5814 3.5814,3.5814 1.9781,0 3.5814,-1.6033 3.5814,-3.5814 0,-0.7775 -0.2478,-1.497 -0.6686,-2.0841l-2.6492 3.3494c-0.1248,0.1929 -0.405,0.2094 -0.55,0.0262l-1.6679 -2.1114c-0.2746,-0.3476 0.2546,-0.7656 0.5292,-0.418l1.4043 1.7757 2.4827 -3.1388c-0.6417,-0.6076 -1.5083,-0.9804 -2.4619,-0.9804z"></path></g></svg>`,
    textFillColor: '#000000'
  },
  oval: {
    xml: `<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle opacity="0.247233" cx="1.5" cy="1.5" r="1.5" fill="white"/>
        </svg>
        `,
    textFillColor: '#ffffff'
  },
  notificationActive: {
    xml: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 31.1667C15.436 31.159 14.1679 29.8972 14.1525 28.3333H19.8192C19.8226 28.712 19.7509 29.0876 19.6081 29.4383C19.2362 30.291 18.4772 30.9129 17.5681 31.11H17.561H17.5426H17.5284H17.5128H17.5029C17.3373 31.1443 17.169 31.1633 17 31.1667ZM28.3333 26.9167H5.66667V24.0833L8.5 22.6667V14.875C8.42537 12.8763 8.87675 10.8929 9.809 9.12333C10.737 7.48214 12.3232 6.31675 14.1667 5.92167V2.83333H19.8333V5.92167C23.4869 6.7915 25.5 9.9705 25.5 14.875V22.6667L28.3333 24.0833V26.9167ZM31.1242 14.1667H28.2908C28.1589 10.503 26.3977 7.08972 23.4883 4.85917L25.5 2.83333C27.1945 4.15151 28.5635 5.84107 29.5021 7.77183C30.4725 9.77079 31.0244 11.9468 31.1242 14.1667ZM5.66667 14.1667H2.83333C2.93301 11.9468 3.48497 9.77078 4.45542 7.77183C5.3939 5.84107 6.76309 4.15151 8.4575 2.83333L10.4692 4.85917C7.55949 7.08945 5.79822 10.5029 5.66667 14.1667Z" fill="black"/>
        </svg>`,
    textFillColor: '#000000'
  },
  notificationDeactivated: {
    xml: `<svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5003 32.0833C15.8896 32.0833 14.5836 30.7775 14.5836 29.1667H20.417C20.417 30.7775 19.1112 32.0833 17.5003 32.0833ZM28.5618 31.9375L24.3326 27.7083H5.83367V24.7917L8.75034 23.3333V15.3125C8.74525 14.334 8.83414 13.3573 9.01576 12.3958L3.81388 7.18812L5.87596 5.12604L30.6224 29.8769L28.5632 31.9375H28.5618ZM26.2488 21.3777L12.0739 7.20125C12.8321 6.67566 13.6841 6.30041 14.5836 6.09583V2.91666H20.417V6.09583C24.178 6.98979 26.2503 10.2637 26.2503 15.3125V21.3792L26.2488 21.3777Z" fill="black"/>
        </svg>`,
    textFillColor: '#000000'
  },
  tick: {
    xml: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M44.022 64.8558L31.254 52.0878L34.79 48.5518L44.022 57.7838L64.754 37.0518L68.29 40.5878L44.022 64.8558Z" fill="white"/>
    <path d="M50.022 90.3203C27.966 90.3203 10.022 72.3763 10.022 50.3203C10.022 28.2643 27.966 10.3203 50.022 10.3203C72.078 10.3203 90.022 28.2643 90.022 50.3203C90.022 72.3763 72.078 90.3203 50.022 90.3203ZM50.022 15.3203C30.722 15.3203 15.022 31.0223 15.022 50.3203C15.022 69.6183 30.722 85.3203 50.022 85.3203C69.322 85.3203 85.022 69.6203 85.022 50.3203C85.022 31.0203 69.32 15.3203 50.022 15.3203Z" fill="white"/>
    </svg>
    `,
    textFillColor: `none`
  },
  untick: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
        >
            <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
            <g stroke="#AF144B" transform="translate(-326 -167)">
                <g transform="translate(8 153)">
                <circle cx="331" cy="27" r="12"></circle>
                </g>
            </g>
            </g>
        </svg>`,
    textFillColor: `none`
  }
};

const diffObj = (obj1, obj2, arrKey) => {
  let result = true;
  _.forEach(arrKey, (key) => {
    result = result && obj1[key] === obj2[key];
  });

  return result;
};

const Content = ({ size, xml, color, textFillColor }) => (
  <View style={{ width: size, height: size }}>
    <SvgXml
      xml={_.replace(xml, new RegExp(textFillColor, 'g'), color)}
      width="100%"
      height="100%"
    />
  </View>
);

export default Icon = (props) => {
  const { name, size, color, onPress, style, disabled } = props;
  const { xml, textFillColor } = objInfo[name] || {};
  if (!xml) return null;

  const content = React.useMemo(
    () => (
      <Content
        size={size}
        xml={xml}
        color={color}
        textFillColor={textFillColor}
      />
    ),
    [size, xml, color, textFillColor]
  );

  return (
    <View style={style}>
      <TouchableOpacity
        hitSlop={props.hitSlop}
        onPress={onPress}
        disabled={disabled || !onPress}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Content
          size={size}
          xml={xml}
          color={color}
          textFillColor={textFillColor}
        />
      </TouchableOpacity>
    </View>
  );
};

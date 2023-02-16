import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import _ from 'lodash';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import ENUM from '~/enum';

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
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><g><polygon points="88.005,39.038 50,14.334 11.995,39.038 50,63.741   "></polygon><polygon points="50,68.994 16.611,47.292 13.766,51.67 50,75.222 86.233,51.67 83.389,47.292   "></polygon><polygon points="50,79.438 16.611,57.735 13.766,62.114 50,85.666 86.233,62.114 83.389,57.735   "></polygon></g></g></svg>`,
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
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><path d="M267.8,374c-10.5-0.4-21.2-0.6-32-0.6c-47.3,0-91.9,3.8-125.4,10.6c-36,7.4-45,15.2-47,17.9   c-0.1,0.4-0.3,0.8-0.5,1.1c0.6,1.3,6.5,10.4,47.6,18.8c33.6,6.9,78.1,10.6,125.4,10.6c13.5,0,26.9-0.3,40-0.9   c-5.9-12.7-9.3-26.9-9.3-41.8C266.5,384.4,267,379.1,267.8,374z"></path><path d="M365.9,306.4c-46,0-83.3,37.4-83.3,83.3S320,473,365.9,473c46,0,83.3-37.4,83.3-83.3   S411.8,306.4,365.9,306.4z M401,399h-28v27c0,4.4-3.6,8-8,8s-8-3.6-8-8v-27h-28c-4.4,0-8-3.6-8-8s3.6-8,8-8h28v-29c0-4.4,3.6-8,8-8   s8,3.6,8,8v29h28c4.4,0,8,3.6,8,8S405.4,399,401,399z"></path><path d="M239,89c9.7,0,19,0.7,29,2.5V70.6c0-17.4-14.6-31.6-32-31.6s-32,14.2-32,31.6v20.9c10-1.9,19.3-2.5,29-2.5   H239z"></path><path d="M235.8,357.4c12.1,0,24.1,0.3,35.9,0.7c13.2-39.3,50.5-67.8,94.2-67.8c1.5,0,3,0,4.5,0.1   c-2.4-9.6-3.4-19.5-3.4-29.5V231c0-1.1-0.2-2.2-0.2-3.3c-0.8-33.1-14.7-64-38.8-87.2c-24.1-23.1-55.7-35.6-89-35.6h-6   c-33.4,0-65.1,12.6-89.1,35.6c-24.1,23.2-37.9,54-38.7,87.1c0,1.1-0.2,2.2-0.2,3.3v29.5c0,13.9-2.2,27.7-6.8,40.9l-26.7,77   c9-3.7,20.6-7,34.7-9.9C140.9,361.3,186.9,357.4,235.8,357.4z"></path></g></svg>`,
    textFillColor: `#171b29`
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
  search: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M31.2,26.9c-1.2-1.2-3.1-1.2-4.2,0c-4.1,4.1-6.4,9.6-6.4,15.5c0,5.8,2.3,11.3,6.4,15.5c0.6,0.6,1.4,0.9,2.1,0.9  s1.5-0.3,2.1-0.9c1.2-1.2,1.2-3.1,0-4.2c-3-3-4.7-7-4.7-11.2s1.7-8.2,4.7-11.2C32.3,30,32.3,28.1,31.2,26.9z"></path><path d="M88,83.8L66.6,62.3c2-2.5,3.7-5.2,4.9-8.1c1.5-3.8,2.3-7.7,2.3-11.8s-0.8-8-2.3-11.8c-1.6-3.9-3.9-7.4-6.9-10.4  c-3-3-6.5-5.3-10.4-6.9c-3.8-1.5-7.7-2.3-11.8-2.3s-8,0.8-11.8,2.3c-3.9,1.6-7.4,3.9-10.4,6.9s-5.3,6.5-6.9,10.4  c-1.5,3.8-2.3,7.7-2.3,11.8s0.8,8,2.3,11.8c1.6,3.9,3.9,7.4,6.9,10.4s6.5,5.3,10.4,6.9c3.8,1.5,7.7,2.3,11.8,2.3s8-0.8,11.8-2.3  c3-1.2,5.7-2.8,8.1-4.9L83.8,88c0.6,0.6,1.4,0.9,2.1,0.9c0.8,0,1.5-0.3,2.1-0.9C89.2,86.9,89.2,85,88,83.8z M42.4,67.7  c-6.8,0-13.1-2.6-17.9-7.4c-9.9-9.9-9.9-25.9,0-35.8c4.9-4.9,11.4-7.4,17.9-7.4c6.5,0,13,2.5,17.9,7.4c9.9,9.9,9.9,25.9,0,35.8  C55.5,65.1,49.2,67.7,42.4,67.7z"></path></svg>`,
    textFillColor: `#ffffff`
  },
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
  purgedState: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        x="0"
        y="0"
        fill="#171b29"
        viewBox="0 0 100 100"
      >
        <g fill="#171b29" fillRule="nonzero">
          <path d="M69.503 35.854l-1.834 44.01c-.013.33-.334.636-.675.636H34.006c-.335 0-.662-.313-.675-.635l-1.834-44.01a3.5 3.5 0 10-6.994.29l1.834 44.011c.17 4.074 3.584 7.344 7.669 7.344h32.988c4.09 0 7.5-3.262 7.67-7.344l1.833-44.01a3.5 3.5 0 10-6.994-.292z"></path>
          <path d="M48 39v34a2.5 2.5 0 105 0V39a2.5 2.5 0 10-5 0zM36.501 39.073l1 34a2.5 2.5 0 004.998-.146l-1-34a2.5 2.5 0 00-4.998.146zM59.501 38.927l-1 34a2.5 2.5 0 004.998.146l1-34a2.5 2.5 0 00-4.998-.146zM25 29h50a3.5 3.5 0 000-7H25a3.5 3.5 0 000 7z"></path>
          <path d="M43.395 23.849l1.03-4.117c.147-.588.97-1.232 1.571-1.232h8.008c.601 0 1.424.643 1.571 1.232l1.03 4.117 6.79-1.698-1.029-4.117c-.926-3.704-4.548-6.534-8.362-6.534h-8.008c-3.814 0-7.437 2.832-8.362 6.534l-1.03 4.117 6.791 1.698z"></path>
        </g>
      </svg>`,
    textFillColor: `#171b29`
  },
  cancelledState: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        x="0"
        y="0"
        fill="#171b29"
        fillRule="evenodd"
        clipRule="evenodd"
        imageRendering="optimizeQuality"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        viewBox="0 0 695 137"
      >
        <path
          d="M68 0h558c38 0 69 31 69 68 0 38-31 69-69 69H68c-37 0-68-31-68-69C0 31 31 0 68 0z"
          className="fil0"
        ></path>
      </svg>`,
    textFillColor: `#171b29`
  },
  expiredState: {
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
          <path d="M64.1 4.8C47.3 4.8 33.3 17.3 31 33.5c.7-.1 1.4-.2 2.2-.2 5.3 0 10.2 2.8 12.9 7.3l18.4 30.9c18.2-.3 32.9-15.1 32.9-33.4.1-18.3-14.9-33.3-33.3-33.3zm13.8 37.1H64.1c-2.1 0-3.7-1.7-3.7-3.7V20.9c0-2.1 1.7-3.7 3.7-3.7 2.1 0 3.7 1.7 3.7 3.7v13.6h10.1c2.1 0 3.7 1.7 3.7 3.7.1 2.1-1.6 3.7-3.7 3.7zM39.2 44.9c-2.7-4.5-9.3-4.5-12 0L3.5 84.7c-2.8 4.6.6 10.5 6 10.5H57c5.4 0 8.7-5.9 6-10.5L39.2 44.9zm-6.3 9c2.2-.2 4.1 1.4 4.2 3.6v.7l-1.3 14.9c-.1 1.4-1.4 2.5-2.8 2.4-1.3-.1-2.3-1.1-2.4-2.4l-1.3-14.9c-.2-2.2 1.4-4.1 3.6-4.3zm.3 33.2c-2.3 0-4.2-1.9-4.2-4.2 0-2.3 1.9-4.2 4.2-4.2 2.3 0 4.2 1.9 4.2 4.2 0 2.3-1.9 4.2-4.2 4.2z"></path>
        </g>
      </svg>`,
    textFillColor: `#171b29`
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
  approvedState: {
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
        <path d="M5268.4 2410.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1s-.4-1-1-1h-4.3zM5272.7 2413.7h-4.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1s-.4-1-1-1zM5272.7 2417h-4.3c-.6 0-1 .4-1 1s.4 1 1 1h4.3c.6 0 1-.4 1-1 0-.5-.4-1-1-1zM31.4 83.2c1.7 1.9 4.2 2.9 6.7 2.9s5-1.1 6.7-2.9l50.2-54c3.4-3.7 3.2-9.5-.5-12.9-3.7-3.4-9.5-3.2-12.9.5L38.1 63.6 18.3 42.3c-3.4-3.7-9.2-3.9-12.9-.5S1.5 51 4.9 54.7l26.5 28.5z"></path>
      </svg>`,
    textFillColor: `#171b29`
  },
  filledState: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="8"
        viewBox="0 0 10 8"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fill="#171B29" fillRule="nonzero" transform="translate(-15 -1491)">
            <g transform="translate(8 697)">
              <g transform="rotate(180 8.5 401)">
                <path
                  d="M1.13939394 0.515555556L4.84848485 4.59555556 8.55757576 0.515555556 9.6969697 1.77777778 4.84848485 7.11111111 0 1.77777778z"
                  transform="rotate(180 4.848 3.813)"
                ></path>
              </g>
            </g>
          </g>
        </g>
      </svg>`,
    textFillColor: `#171b29`
  },
  placeState: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fill="#171B29" fillRule="nonzero" transform="translate(-13 -2884)">
            <g transform="translate(8 697)">
              <g transform="translate(5 2187)">
                <path d="M6.682 0c1.802 0 3.263 1.567 3.263 3.5S8.484 7 6.682 7C4.879 7 3.418 5.433 3.418 3.5S4.879 0 6.682 0zm0 8.75c3.606 0 6.527 1.566 6.527 3.5V14H.155v-1.75c0-1.934 2.92-3.5 6.527-3.5z"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>`,
    textFillColor: `#171b29`
  },
  newState: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="14"
        viewBox="0 0 12 14"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fill="#171B29" fillRule="nonzero" transform="translate(-14 -2562)">
            <g transform="translate(8 697)">
              <g transform="translate(6 1865)">
                <path d="M7.05130518 1.64705882L6.75825336 0 0.164587332 0 0.164587332 14 1.62984645 14 1.62984645 8.23529412 5.73257198 8.23529412 6.0256238 9.88235294 11.1540307 9.88235294 11.1540307 1.64705882z"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>`,
    textFillColor: `#171b29`
  },
  triggerState: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      x="0"
      y="0"
      fill="#57e1f1"
      viewBox="-53.24 -51.863 1024 1024"
    >
      <path d="M340.379 85.038h373.837l-24.177-42.132-46.853 87.026-91.334 169.651a6473315.018 6473315.018 0 00-64.367 119.56c-9.964 18.507 2.389 42.132 24.177 42.132h202.553l-19.799-47.799-52.789 46.116L516.242 569.13a19703299.475 19703299.475 0 00-317.3 277.196l46.799 27.242 29.941-88.922 60.931-180.955 48.578-144.27 6.298-18.703c5.868-17.429-9.572-35.443-27-35.443H216.476l27 35.443 32.586-98.951 60.115-182.541 31.202-94.745c4.775-14.5-5.396-30.548-19.557-34.443-15.266-4.199-29.673 5.073-34.443 19.557l-32.586 98.951-60.115 182.541-31.202 94.745c-5.746 17.448 9.48 35.443 27 35.443h148.013l-27-35.443-29.941 88.922-60.931 180.955-48.578 144.27-6.298 18.703c-3.979 11.815 2.498 25.546 12.868 31.62 11.417 6.688 24.376 3.97 33.931-4.378l52.789-46.116L416.715 730.27A19703299.477 19703299.477 0 01687.398 493.8l46.617-40.726c7.377-6.444 9.712-18.113 7.201-27.242-3.304-12.011-14.548-20.557-27-20.557H511.663l24.177 42.132 46.853-87.026 91.335-169.651 61.986-115.139 2.38-4.421c9.964-18.507-2.388-42.132-24.177-42.132H340.38c-15.263 0-28 12.737-28 28s12.736 28 27.999 28z"></path>
    </svg>`,
    textFillColor: `#171b29`
  },
  nounRemove: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" x="0px" y="0px"><title>Artboard 10</title><g data-name="Layer 2"><path d="M16,31A15,15,0,1,1,31,16,15,15,0,0,1,16,31ZM16,3A13,13,0,1,0,29,16,13,13,0,0,0,16,3Z"></path><rect x="7.92" y="15" width="16.16" height="2" rx="1" ry="1"></rect></g></svg>`,
    textFillColor: `#ffffff`
  },
  nounPlus: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" x="0px" y="0px"><title>plus-circle</title><path d="M8 14.857c-0.005 0-0.010 0-0.016 0-0.631 0-1.143 0.511-1.143 1.143s0.511 1.143 1.143 1.143c0.006 0 0.011 0 0.017 0h15.998c0.005 0 0.010 0 0.016 0 0.631 0 1.143-0.511 1.143-1.143s-0.511-1.143-1.143-1.143c-0.006 0-0.011 0-0.017 0z"></path><path d="M17.143 8c0-0.005 0-0.010 0-0.016 0-0.631-0.511-1.143-1.143-1.143s-1.143 0.511-1.143 1.143c0 0.006 0 0.011 0 0.017v-0.001 15.999c0 0.005 0 0.010 0 0.016 0 0.631 0.511 1.143 1.143 1.143s1.143-0.511 1.143-1.143c0-0.006 0-0.011 0-0.017v0.001z"></path><path d="M16 0c-8.823 0-15.999 7.177-15.999 15.999s7.177 15.999 15.999 15.999c8.823 0 15.999-7.177 15.999-15.999s-7.177-15.999-15.999-15.999zM16 2.286c7.588 0 13.714 6.127 13.714 13.714s-6.126 13.714-13.714 13.714c-7.588 0-13.714-6.126-13.714-13.714s6.126-13.714 13.714-13.714z"></path></svg>`,
    textFillColor: `#ffffff`
  },
  dragSlider: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="20"
        viewBox="0 0 25 20"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g transform="translate(-72 -595)">
            <g transform="translate(0 59)">
              <g>
                <g transform="translate(8 536)">
                  <g transform="translate(64)">
                    <rect
                      width="25"
                      height="20"
                      x="0"
                      y="0"
                      fill="#FD3754"
                      rx="2"
                    ></rect>
                    <path
                      stroke="#171B29"
                      strokeWidth="2"
                      d="M7.5 5L7.5 15"
                    ></path>
                    <path
                      stroke="#171B29"
                      strokeWidth="2"
                      d="M12.5 5L12.5 15"
                    ></path>
                    <path
                      stroke="#171B29"
                      strokeWidth="2"
                      d="M17.5 5L17.5 15"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>`,
    textFillColor: `#FD3754`
  },
  calendar: {
    xml: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="18"
        viewBox="0 0 16 18"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fill="#57E1F1" fillRule="nonzero" transform="translate(-165 -348)">
            <g transform="translate(0 59)">
              <g>
                <path d="M165 292.6c0-.99.8-1.8 1.778-1.8h12.444c.982 0 1.778.805 1.778 1.8v12.6c0 .995-.796 1.8-1.778 1.8h-12.444a1.788 1.788 0 01-1.778-1.8v-12.6zm1.778 1.8v10.8h12.444v-10.8h-12.444zm1.778-5.4h1.777v1.8h-1.777V289zm7.11 0h1.778v1.8h-1.777V289zm-7.11 8.1h1.777v1.8h-1.777v-1.8zm0 3.6h1.777v1.8h-1.777v-1.8zm3.555-3.6h1.778v1.8h-1.778v-1.8zm0 3.6h1.778v1.8h-1.778v-1.8zm3.556-3.6h1.777v1.8h-1.777v-1.8zm0 3.6h1.777v1.8h-1.777v-1.8z"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>`,
    textFillColor: `#57E1F1`
  },
  rejectState: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="487.595"
      height="487.595"
      viewBox="0 0 365.696 365.696"
    >
      <path d="M243.188 182.86L356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"></path>
    </svg>`,
    textFillColor: `#171b29`
  },
  doneForDayState: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      enableBackground="new 0 0 489.418 489.418"
      version="1.1"
      viewBox="0 0 489.418 489.418"
      xmlSpace="preserve"
    >
      <path d="M244.709 389.496c18.736 0 34.332-14.355 35.91-33.026l24.359-290.927a60.493 60.493 0 00-15.756-46.011C277.783 7.09 261.629 0 244.709 0s-33.074 7.09-44.514 19.532a60.485 60.485 0 00-15.755 46.011l24.359 290.927c1.578 18.671 17.174 33.026 35.91 33.026zM244.709 410.908c-21.684 0-39.256 17.571-39.256 39.256 0 21.683 17.572 39.254 39.256 39.254s39.256-17.571 39.256-39.254c0-21.685-17.572-39.256-39.256-39.256z"></path>
    </svg>`,
    textFillColor: `#171b29`
  },
  added: {
    xml: `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Group 5</title>
    <g id="Watchlist" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Search-Symbols-Copy-6" transform="translate(-327.000000, -168.000000)" stroke="#3A425E">
            <g id="Group-5" transform="translate(327.000000, 168.000000)">
                <circle id="Oval" cx="12" cy="12" r="11.5"></circle>
                <polyline id="Path-2" stroke-width="2" points="8 11.6666345 11.8173899 16 16 8"></polyline>
            </g>
        </g>
    </g>
</svg>`,
    textFillColor: '#3A425E'
  },
  untick: {
    xml: `<svg width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Oval</title>
    <g id="Watchlist" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Search-Symbols" transform="translate(-326.000000, -167.000000)" stroke="#3A425E">
            <g id="Group-6" transform="translate(8.000000, 153.000000)">
                <circle id="Oval" cx="331" cy="27" r="12"></circle>
            </g>
        </g>
    </g>
</svg>`,
    textFillColor: '#3A425E'
  },
  selected: {
    xml: `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Group</title>
    <g id="Watchlist" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Manage-User-Watchlist-(2)-Copy" transform="translate(-8.000000, -242.000000)" stroke="#57E1F1">
            <g id="Group" transform="translate(8.000000, 242.000000)">
                <polyline id="Path-2" stroke-width="2" points="8 11.6666345 11.8173899 16 16 8"></polyline>
                <circle id="Oval" cx="12" cy="12" r="11.5"></circle>
            </g>
        </g>
    </g>
</svg>`,
    textFillColor: '#57E1F1'
  },
  usFlag: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      enableBackground="new 0 0 473.677 473.677"
      version="1.1"
      viewBox="0 0 473.677 473.677"
      xmlSpace="preserve"
    >
      <g fill="#C42126">
        <path d="M1.068 258.99H472.628V258.997H1.068z"></path>
        <path d="M25.629 129.7H448.04900000000004V129.707H25.629z"></path>
        <path d="M8.831 172.79H464.831V172.797H8.831z"></path>
        <path d="M101.793 431.36L371.888 431.36 371.902 431.345 101.778 431.345z"></path>
        <path d="M236.837 0c-4.652 0-9.267.168-13.848.43h27.699C246.103.168 241.489 0 236.837 0z"></path>
        <path d="M0.978 215.89H472.688V215.897H0.978z"></path>
      </g>
      <path
        fill="#E7E7E7"
        d="M306.838 86.609H419.93c-13.433-16.353-29.045-30.829-46.341-43.084h-84.922c7.027 12.363 13.07 26.951 18.171 43.084z"
      ></path>
      <path
        fill="#DC3027"
        d="M288.667 43.525h84.922C338.482 18.646 296.333 3.066 250.688.43h-7.292c21.484 2.704 31.352 18.604 45.271 43.095z"
      ></path>
      <path
        fill="#E7E7E7"
        d="M464.846 172.794a235.273 235.273 0 00-16.798-43.084H317.94c2.636 13.833 4.716 28.282 6.256 43.084h140.65z"
      ></path>
      <path
        fill="#DC3027"
        d="M310.622 129.703h137.422c-7.831-15.403-17.239-29.857-28.114-43.091H299.886c4.233 13.399 7.827 27.853 10.736 43.091z"
      ></path>
      <path
        fill="#E7E7E7"
        d="M329.178 258.98h143.431c.681-7.288 1.066-14.674 1.066-22.138 0-7.064-.37-14.038-.976-20.949H329.212a644.79 644.79 0 01-.034 43.087z"
      ></path>
      <path
        fill="#DC3027"
        d="M472.703 215.886a235.89 235.89 0 00-7.857-43.084H318.154c1.473 14.109 2.446 28.544 2.921 43.084h151.628z"
      ></path>
      <path
        fill="#E7E7E7"
        d="M315.465 345.166h131.962a234.945 234.945 0 0017.075-43.091H321.845c-1.571 14.824-3.703 29.27-6.38 43.091z"
      ></path>
      <path
        fill="#DC3027"
        d="M464.506 302.072a235.37 235.37 0 008.107-43.084H324.709c-.505 14.551-1.507 28.982-3.01 43.084h142.807z"
      ></path>
      <path
        fill="#E7E7E7"
        d="M371.902 431.345c17.546-12.206 33.379-26.697 47.025-43.084H307.806c-5.194 16.2-11.361 30.765-18.515 43.084h82.611z"
      ></path>
      <g fill="#DC3027">
        <path d="M303.625 388.258h115.302c11.002-13.219 20.553-27.673 28.499-43.091h-132.93c-2.95 15.249-6.581 29.71-10.871 43.091zM228.254 473.509c-.479-.015-.957-.037-1.436-.052.479.014.958.037 1.436.052zM236.837 473.677c50.211 0 96.735-15.673 135.051-42.317h-85.715c-15.213 26.21-25.25 42.317-49.336 42.317z"></path>
      </g>
      <path
        fill="#C42126"
        d="M236.837 473.677c-2.876 0-5.733-.067-8.582-.168 2.879.097 5.739.168 8.582.168z"
      ></path>
      <path
        fill="#F3F4F5"
        d="M296.509 43.525H100.092C82.793 55.78 67.184 70.255 53.747 86.609h260.929c-5.101-16.133-11.14-30.721-18.167-43.084z"
      ></path>
      <path
        fill="#E73625"
        d="M100.092 43.525h196.417C282.587 19.034 264.88 3.134 243.396.43h-20.407c-45.645 2.636-87.794 18.216-122.897 43.095z"
      ></path>
      <path
        fill="#F3F4F5"
        d="M8.835 172.794h322.83c-1.541-14.805-3.62-29.251-6.256-43.084H25.633a235.229 235.229 0 00-16.798 43.084z"
      ></path>
      <path
        fill="#E73625"
        d="M53.747 86.609C42.88 99.843 33.464 114.296 25.637 129.7h299.772c-2.906-15.235-6.499-29.688-10.733-43.091H53.747z"
      ></path>
      <path
        fill="#F3F4F5"
        d="M.002 236.842c0 7.464.389 14.85 1.066 22.138h333.491c.494-14.323.501-28.754.034-43.084H.978c-.606 6.908-.976 13.882-.976 20.946z"
      ></path>
      <path
        fill="#E73625"
        d="M.978 215.886h333.611a608.368 608.368 0 00-2.921-43.084H8.831a235.592 235.592 0 00-7.853 43.084z"
      ></path>
      <path
        fill="#F3F4F5"
        d="M331.549 302.072H9.175a235.116 235.116 0 0017.075 43.091h298.919c2.678-13.818 4.805-28.264 6.38-43.091z"
      ></path>
      <path
        fill="#E73625"
        d="M9.175 302.072h322.374c1.5-14.102 2.505-28.537 3.01-43.084H1.068a235.66 235.66 0 008.107 43.084z"
      ></path>
      <path
        fill="#F3F4F5"
        d="M101.778 431.345h194.009c7.154-12.322 13.324-26.884 18.515-43.084H54.753a238.109 238.109 0 0047.025 43.084z"
      ></path>
      <g fill="#E73625">
        <path d="M26.254 345.166c7.947 15.418 17.497 29.872 28.499 43.091h259.549c4.286-13.38 7.917-27.841 10.867-43.091H26.254zM226.818 473.456c.479.015.957.037 1.436.052 2.85.101 5.707.168 8.582.168 24.087 0 43.727-16.106 58.943-42.317H101.793c35.747 24.862 78.655 40.164 125.025 42.097z"></path>
      </g>
      <path
        fill="#283991"
        d="M231.941.123C110.574 2.592 11.654 96.301 1.008 215.5h230.937V.123h-.004z"
      ></path>
      <g fill="#EFEFEF">
        <path d="M47.39 134.187L50.998 145.297 62.688 145.297 53.231 152.167 56.843 163.285 47.39 156.411 37.94 163.285 41.545 152.167 32.091 145.297 43.781 145.297z"></path>
        <path d="M47.39 173.438L50.998 184.555 62.688 184.555 53.231 191.425 56.843 202.543 47.39 195.669 37.94 202.543 41.545 191.425 32.091 184.555 43.781 184.555z"></path>
        <path d="M86.648 75.296L90.257 86.41 101.943 86.41 92.489 93.284 96.098 104.394 86.648 97.528 77.194 104.394 80.803 93.284 71.345 86.41 83.035 86.41z"></path>
        <path d="M86.648 114.554L90.257 125.668 101.943 125.668 92.489 132.534 96.098 143.652 86.648 136.786 77.194 143.652 80.803 132.534 71.345 125.668 83.035 125.668z"></path>
        <path d="M86.648 153.812L90.257 164.93 101.943 164.93 92.489 171.792 96.098 182.91 86.648 176.037 77.194 182.91 80.803 171.792 71.345 164.93 83.035 164.93z"></path>
        <path d="M17.585 182.91l-3.612-11.118 9.454-6.866H11.744l-.262-.811a226.718 226.718 0 00-3.511 12.045l.165-.123 9.449 6.873zM37.94 124.027l9.45-6.873 9.454 6.873-3.612-11.118 9.454-6.873h-11.69l-3.609-11.11-3.609 11.11H39.47c-.8 1.212-1.574 2.431-2.352 3.661l4.428 3.212-3.606 11.118zM86.648 58.27l9.45 6.866-3.609-11.11 9.45-6.873h-6.75a235.186 235.186 0 00-16.578 13.608l-1.425 4.375 9.462-6.866zM116.452 45.511l9.454-6.873 9.45 6.873-3.609-11.118 9.45-6.866h-11.686l-.49-1.496c-3.96 2.023-7.879 4.128-11.709 6.368l2.745 1.993-3.605 11.119z"></path>
        <path d="M125.906 55.671L129.515 66.778 141.201 66.778 131.747 73.651 135.356 84.769 125.906 77.895 116.452 84.769 120.061 73.651 110.604 66.778 122.293 66.778z"></path>
        <path d="M125.906 94.929L129.515 106.036 141.201 106.036 131.747 112.909 135.356 124.027 125.906 117.153 116.452 124.027 120.061 112.909 110.604 106.036 122.293 106.036z"></path>
        <path d="M125.906 134.187L129.515 145.297 141.201 145.297 131.747 152.167 135.356 163.285 125.906 156.411 116.452 163.285 120.061 152.167 110.604 145.297 122.293 145.297z"></path>
        <path d="M125.906 173.438L129.515 184.555 141.201 184.555 131.747 191.425 135.356 202.543 125.906 195.669 116.452 202.543 120.061 191.425 110.604 184.555 122.293 184.555z"></path>
        <path d="M165.164 36.038L168.773 47.152 180.459 47.152 171.009 54.026 174.614 65.136 165.164 58.27 155.707 65.136 159.319 54.026 149.862 47.152 161.551 47.152z"></path>
        <path d="M165.164 75.296L168.773 86.41 180.459 86.41 171.009 93.284 174.614 104.394 165.164 97.528 155.707 104.394 159.319 93.284 149.862 86.41 161.551 86.41z"></path>
        <path d="M165.164 114.554L168.773 125.668 180.459 125.668 171.009 132.534 174.614 143.652 165.164 136.786 155.707 143.652 159.319 132.534 149.862 125.668 161.551 125.668z"></path>
        <path d="M165.164 153.812L168.773 164.93 180.459 164.93 171.009 171.792 174.614 182.91 165.164 176.037 155.707 182.91 159.319 171.792 149.862 164.93 161.551 164.93z"></path>
        <path d="M204.422 16.413L208.031 27.527 219.717 27.527 210.263 34.393 213.872 45.511 204.422 38.637 194.965 45.511 198.577 34.393 189.12 27.527 200.806 27.527z"></path>
        <path d="M204.422 55.671L208.031 66.778 219.717 66.778 210.263 73.651 213.872 84.769 204.422 77.895 194.965 84.769 198.577 73.651 189.12 66.778 200.806 66.778z"></path>
        <path d="M204.422 94.929L208.031 106.036 219.717 106.036 210.263 112.909 213.872 124.027 204.422 117.153 194.965 124.027 198.577 112.909 189.12 106.036 200.806 106.036z"></path>
        <path d="M204.422 134.187L208.031 145.297 219.717 145.297 210.263 152.167 213.872 163.285 204.422 156.411 194.965 163.285 198.577 152.167 189.12 145.297 200.806 145.297z"></path>
        <path d="M204.422 173.438L208.031 184.555 219.717 184.555 210.263 191.425 213.872 202.543 204.422 195.669 194.965 202.543 198.577 191.425 189.12 184.555 200.806 184.555z"></path>
      </g>
    </svg>`,
    textFillColor: '#C42126'
  },
  done: {
    xml: `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            x="0"
            y="0"
            fill="#fff"
            viewBox="0 0 100 100"
        >
            <path d="M69.437 43.303l-24.12 25.753c-.817.871-1.851 1.307-2.995 1.307s-2.232-.436-2.995-1.307L27.241 56.152a4.063 4.063 0 01.218-5.771c1.633-1.525 4.192-1.416 5.771.218l9.093 9.691 21.18-22.595c1.524-1.633 4.138-1.742 5.771-.163 1.633 1.524 1.742 4.083.163 5.771z"></path>
            <path d="M5.082 50C5.082 25.227 25.172 5.136 50 5.082 74.773 5.136 94.918 25.227 94.918 50c0 24.828-20.145 44.918-44.918 44.918-24.828 0-44.918-20.09-44.918-44.918zm18.893 26.025C30.672 82.668 39.819 86.751 50 86.751c10.127 0 19.328-4.083 25.971-10.726 6.642-6.697 10.78-15.844 10.78-26.025 0-10.127-4.138-19.274-10.78-25.971-6.643-6.642-15.844-10.78-25.971-10.78-10.181 0-19.328 4.138-26.025 10.78C17.332 30.726 13.249 39.873 13.249 50c0 10.181 4.083 19.328 10.726 26.025z"></path>
        </svg>`,
    textFillColor: `#fff`
  },
  auFlag: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      enableBackground="new 0 0 512 512"
      version="1.1"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
    >
      <path
        fill="#0052B4"
        d="M512 256c0 141.384-114.616 256-256 256S0 397.384 0 256C0 256.06 256 .029 256 0c141.384 0 256 114.616 256 256z"
      ></path>
      <g fill="#F0F0F0">
        <path d="M256 0l-.043.001L256 0zM255.315 256H256v-.685l-.685.685z"></path>
        <path d="M256 133.566V.001h-.043C114.592.024 0 114.629 0 256h133.565v-75.212L208.777 256h46.539l.685-.685v-46.536l-75.213-75.213H256z"></path>
      </g>
      <g fill="#D80027">
        <path d="M129.515 33.391a257.222 257.222 0 00-96.124 96.124V256h66.783V100.174H256V33.391H129.515z"></path>
        <path d="M256 224.519l-90.953-90.952h-31.481c0-.001 0 0 0 0L255.999 256H256v-31.481z"></path>
      </g>
      <g fill="#F0F0F0">
        <path d="M154.395 300.522L168.445 329.9 200.172 322.567 185.964 351.869 211.478 372.102 179.711 379.262 179.8 411.826 154.395 391.453 128.991 411.826 129.08 379.262 97.312 372.102 122.827 351.869 108.617 322.567 140.346 329.9z"></path>
        <path d="M383.284 356.174L390.309 370.863 406.173 367.196 399.068 381.847 411.826 391.964 395.942 395.544 395.986 411.826 383.284 401.639 370.582 411.826 370.626 395.544 354.743 391.964 367.5 381.847 360.396 367.196 376.259 370.863z"></path>
        <path d="M317.933 200.348L324.957 215.038 340.821 211.37 333.717 226.021 346.474 236.138 330.591 239.718 330.634 256 317.933 245.813 305.231 256 305.274 239.718 289.391 236.138 302.148 226.021 295.044 211.37 310.908 215.038z"></path>
        <path d="M383.284 111.304L390.309 125.994 406.173 122.327 399.069 136.978 411.825 147.094 395.942 150.675 395.986 166.957 383.284 156.77 370.582 166.957 370.626 150.675 354.743 147.094 367.499 136.978 360.396 122.327 376.259 125.994z"></path>
        <path d="M440.368 178.087L447.392 192.777 463.256 189.109 456.152 203.76 468.909 213.877 453.025 217.458 453.069 233.739 440.368 223.553 427.666 233.739 427.709 217.458 411.826 213.877 424.583 203.76 417.479 189.109 433.342 192.777z"></path>
        <path d="M399.55 256L405.075 273.006 422.957 273.006 408.49 283.517 414.017 300.522 399.55 290.012 385.084 300.522 390.609 283.517 376.143 273.006 394.024 273.006z"></path>
      </g>
    </svg>`,
    textFillColor: '#0052B4'
  },
  nounUpload: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 48 48" style="enable-background:new 0 0 48 48;" xml:space="preserve">
	<path d="M24,40.1c0.58,0,1.06-0.48,1.06-1.06V15.15l7.82,10.09c0.35,0.45,1.02,0.54,1.49,0.19c0.46-0.36,0.54-1.03,0.19-1.49  l-9.7-12.52l-0.08-0.11l-0.07-0.04c-0.1-0.09-0.22-0.16-0.35-0.21v-0.04l-0.02,0.03c-0.21-0.07-0.45-0.07-0.66,0l-0.02-0.03v0.04  c-0.13,0.05-0.24,0.12-0.35,0.21l-9.85,12.68c-0.36,0.46-0.27,1.13,0.19,1.49c0.45,0.34,1.13,0.26,1.48-0.19l7.81-10.09v23.89  C22.94,39.63,23.42,40.1,24,40.1z"></path>
	<path d="M12.55,10.02h22.89c0.58,0,1.06-0.48,1.06-1.06c0-0.58-0.48-1.06-1.06-1.06H12.55c-0.58,0-1.06,0.48-1.06,1.06  C11.5,9.54,11.97,10.02,12.55,10.02z"></path>
</svg>`,
    textFillColor: '#ffff'
  },
  nounCancel: {
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25px" height="25px" viewBox="0 0 25 25" version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink">
	<title>noun_cancel_1271700</title>
	<g id="Watchlist" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
		<g id="Edit-Watchlist-(Unselected)" transform="translate(-16.000000, -55.000000)">
			<image id="noun_cancel_1271700" x="16" y="55" width="25" height="25" xlink:href="data:image/png;base64,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"></image>
		</g>
	</g>
</svg>`,
    textFillColor: '#ffffff'
  },
  greaterThanOrEqualTo: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100"
      xml:space="preserve"><g><g><path fill="#ffffff" d="M68.108,62.534c-7.853-7.164-15.706-14.327-23.559-21.49c-3.564-3.252-8.884,2.037-5.304,5.303    c7.853,7.164,15.706,14.327,23.56,21.49C66.37,71.089,71.689,65.8,68.108,62.534L68.108,62.534z"></path></g></g><g><g><path fill="#ffffff" d="M44.55,46.347c7.802-7.802,15.604-15.605,23.406-23.407c3.423-3.423-1.88-8.727-5.303-5.304    c-7.803,7.803-15.605,15.605-23.407,23.408C35.824,44.467,41.127,49.77,44.55,46.347L44.55,46.347z"></path></g></g><g><g><path fill="#ffffff" d="M59.38,73.801c-7.853-7.164-15.706-14.327-23.559-21.49c-3.564-3.252-8.884,2.037-5.304,5.303    c7.853,7.164,15.706,14.327,23.56,21.49C57.642,82.355,62.961,77.066,59.38,73.801L59.38,73.801z">
      </path></g></g></svg>`,
    textFillColor: '#ffff'
  },
  lessThanOrEqualTo: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><g><path fill="#ffffff" d="M32.518,24.177c7.853,7.164,15.706,14.327,23.56,21.49c3.564,3.252,8.884-2.037,5.303-5.303    C53.527,33.2,45.674,26.037,37.821,18.873C34.257,15.622,28.938,20.911,32.518,24.177L32.518,24.177z"></path></g></g><g><g><path fill="#ffffff" d="M56.077,40.364c-7.803,7.802-15.605,15.605-23.407,23.408c-3.422,3.423,1.881,8.726,5.304,5.303    c7.802-7.802,15.604-15.604,23.406-23.407C64.803,42.245,59.5,36.941,56.077,40.364L56.077,40.364z"></path></g></g><g><g><path fill="#ffffff" d="M64.806,50.126c-7.803,7.802-15.604,15.605-23.407,23.408c-3.422,3.423,1.881,8.726,5.304,5.303    c7.802-7.802,15.604-15.604,23.406-23.407C73.531,52.007,68.229,46.704,64.806,50.126L64.806,50.126z">
    </path></g></g></svg>`,
    textFillColor: '#ffff'
  },
  noun_discount: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve"><title>Artboard 32</title><g><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M10.2,10.2C10.5,9,11.6,8.1,12.8,8c1.2-0.1,2.5,0.7,3,1.8   c0.5,1.1,0.1,2.6-0.8,3.4c-1.7,1.4-4.1,0.5-4.7-1.3C10.1,11.4,10.1,10.8,10.2,10.2z M12.8,22.1c0,0.1-0.1,0.1-0.1,0.2   c-0.1,0.2-0.3,0.3-0.5,0.4c-0.2,0.1-0.5,0-0.8-0.1c-0.1-0.1-0.2-0.1-0.3-0.2c-0.1-0.1-0.1-0.2-0.2-0.3c-0.1-0.2-0.1-0.4,0-0.6   c0.1-0.2,0.2-0.3,0.3-0.5c2.7-3.7,5.3-7.5,8-11.2c0.1-0.2,0.3-0.4,0.5-0.5c0.3-0.2,0.8-0.2,1.1,0c0.3,0.2,0.5,0.7,0.3,1.1   c-0.1,0.2-0.2,0.4-0.3,0.5C18.1,14.7,15.5,18.4,12.8,22.1z M21.9,21.2c0,0.4-0.1,0.7-0.3,1c-0.4,0.7-1.1,1.3-1.9,1.5   c-2.7,0.6-4.6-2.7-2.8-4.7c0.8-0.9,2.2-1.2,3.3-0.7C21.3,18.8,22.1,20,21.9,21.2z"></path><path d="M19.4,20.2c-0.4-0.2-0.8-0.1-1,0.2c-0.6,0.6,0,1.7,0.9,1.5c0.4-0.1,0.7-0.4,0.7-0.8C20,20.7,19.7,20.3,19.4,20.2z"></path><path d="M13.3,11.8c0.4-0.1,0.7-0.4,0.7-0.8c0-0.4-0.2-0.8-0.5-0.9c-0.4-0.2-0.8-0.1-1,0.2C11.8,11,12.5,12,13.3,11.8z"></path></g></svg>`,
    textFillColor: '#ffffff'
  },
  nound_dolar: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"><g><g><path d="M16,1C7.7,1,1,7.7,1,16c0,8.3,6.7,15,15,15s15-6.7,15-15C31,7.7,24.3,1,16,1z M21,19.7c0,2.1-1.7,3.8-4,4.2V25    c0,0.5-0.5,1-1,1c-0.6,0-1-0.5-1-1v-1.1c-2.3-0.4-4-2.1-4-4.2c0-0.6,0.5-1,1-1s1,0.4,1,1c0,1,0.8,1.8,2,2.1v-4.5    c-2.3-0.4-4-2.1-4-4.2s1.7-3.8,4-4.2V7.9c0-0.5,0.4-1,1-1c0.5,0,1,0.5,1,1V9c2.3,0.4,4,2.1,4,4.2c0,0.5-0.5,1-1,1s-1-0.5-1-1    c0-1-0.8-1.8-2-2.1v4.5C19.3,15.9,21,17.7,21,19.7z"></path><path d="M17,21.9c1.2-0.3,2-1.2,2-2.1c0-1-0.8-1.8-2-2.1V21.9z"></path><path d="M13,13.2c0,1,0.8,1.8,2,2.1v-4.3C13.8,11.4,13,12.2,13,13.2z"></path></g></g></svg>`,
    textFillColor: '#ffffff'
  },
  nound_coins: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve"><g><ellipse cx="8" cy="3" rx="5" ry="2"></ellipse><path d="M12.443,5.1C11.272,5.71,9.603,6,8,6S4.728,5.71,3.557,5.1C3.213,5.372,3,5.675,3,6c0,1.105,2.239,2,5,2s5-0.895,5-2   C13,5.675,12.787,5.372,12.443,5.1z"></path><path d="M12.443,8.1C11.272,8.71,9.603,9,8,9S4.728,8.71,3.557,8.1C3.213,8.372,3,8.675,3,9c0,1.105,2.239,2,5,2s5-0.895,5-2   C13,8.675,12.787,8.372,12.443,8.1z"></path><path d="M12.443,11.1C11.272,11.71,9.603,12,8,12s-3.272-0.29-4.443-0.9C3.213,11.372,3,11.675,3,12c0,1.105,2.239,2,5,2   s5-0.895,5-2C13,11.675,12.787,11.372,12.443,11.1z"></path></g></svg>`,
    textFillColor: '#ffffff'
  },
  noun_push: {
    xml: `<svg height='100px' width='100px'  fill="#ffffff" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" x="0px" y="0px"><title>plus-circle</title><path d="M8 14.857c-0.005 0-0.010 0-0.016 0-0.631 0-1.143 0.511-1.143 1.143s0.511 1.143 1.143 1.143c0.006 0 0.011 0 0.017 0h15.998c0.005 0 0.010 0 0.016 0 0.631 0 1.143-0.511 1.143-1.143s-0.511-1.143-1.143-1.143c-0.006 0-0.011 0-0.017 0z"></path><path d="M17.143 8c0-0.005 0-0.010 0-0.016 0-0.631-0.511-1.143-1.143-1.143s-1.143 0.511-1.143 1.143c0 0.006 0 0.011 0 0.017v-0.001 15.999c0 0.005 0 0.010 0 0.016 0 0.631 0.511 1.143 1.143 1.143s1.143-0.511 1.143-1.143c0-0.006 0-0.011 0-0.017v0.001z"></path><path d="M16 0c-8.823 0-15.999 7.177-15.999 15.999s7.177 15.999 15.999 15.999c8.823 0 15.999-7.177 15.999-15.999s-7.177-15.999-15.999-15.999zM16 2.286c7.588 0 13.714 6.127 13.714 13.714s-6.126 13.714-13.714 13.714c-7.588 0-13.714-6.126-13.714-13.714s6.126-13.714 13.714-13.714z"></path></svg>`,
    textFillColor: '#ffffff'
  },
  noun_maintenance: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><g><g i:extraneous="self"><g><path d="M5273.1,2400.1v-2c0-2.8-5-4-9.7-4s-9.7,1.3-9.7,4v2c0,1.8,0.7,3.6,2,4.9l5,4.9c0.3,0.3,0.4,0.6,0.4,1v6.4     c0,0.4,0.2,0.7,0.6,0.8l2.9,0.9c0.5,0.1,1-0.2,1-0.8v-7.2c0-0.4,0.2-0.7,0.4-1l5.1-5C5272.4,2403.7,5273.1,2401.9,5273.1,2400.1z      M5263.4,2400c-4.8,0-7.4-1.3-7.5-1.8v0c0.1-0.5,2.7-1.8,7.5-1.8c4.8,0,7.3,1.3,7.5,1.8C5270.7,2398.7,5268.2,2400,5263.4,2400z"></path><path d="M5268.4,2410.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1c0-0.6-0.4-1-1-1H5268.4z"></path><path d="M5272.7,2413.7h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2414.1,5273.3,2413.7,5272.7,2413.7z"></path><path d="M5272.7,2417h-4.3c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h4.3c0.6,0,1-0.4,1-1C5273.7,2417.5,5273.3,2417,5272.7,2417z"></path></g><g><path d="M94.3,39.7h-7.4c-0.9-3.1-2.1-6-3.6-8.7l5.2-5.2c1.3-1.2,1.3-3.3,0-4.5l-9.9-9.9c-1.2-1.3-3.3-1.3-4.5,0l-5.2,5.2     c-2.7-1.5-5.6-2.7-8.7-3.6V5.7c0-1.8-1.4-3.2-3.2-3.2h-14c-1.8,0-3.2,1.4-3.2,3.2v7.3c-3.1,0.9-6,2.1-8.7,3.6l-5.2-5.2     c-1.2-1.3-3.3-1.3-4.5,0l-9.9,9.9c-1.3,1.2-1.3,3.3,0,4.5l5.2,5.2c-1.5,2.7-2.7,5.6-3.6,8.7H5.7c-1.8,0-3.2,1.4-3.2,3.2v14     c0,1.8,1.4,3.2,3.2,3.2h7.3c0.9,3.1,2.1,6,3.6,8.7l-5.2,5.2c-1.3,1.2-1.3,3.3,0,4.5l9.9,9.9c1.2,1.3,3.3,1.3,4.5,0l5.2-5.2     c2.7,1.5,5.6,2.7,8.7,3.6v7.3c0,1.8,1.4,3.2,3.2,3.2h14c1.8,0,3.2-1.4,3.2-3.2v-7.3c3-0.8,5.8-2,8.4-3.5L57.5,72.2     c-1.9,0.6-3.9,1.1-5.9,1.2c-13,0.9-24.7-9.7-25-22.7c-0.1-2.8,0.3-5.5,1.2-8.1c0.3-0.9,1.5-1.1,2.2-0.5l14.4,14.4     c0.5,0.5,1.3,0.5,1.8,0l10.5-10.5c0.5-0.5,0.5-1.3,0-1.8L42.2,29.9c-0.7-0.7-0.4-1.9,0.5-2.2c4-1.3,8.4-1.6,13-0.5     c9,2.2,16,9.8,17.5,18.9c0.6,4,0.2,7.8-0.9,11.2l11.3,11.3c1.5-2.6,2.6-5.5,3.4-8.5h7.3c1.8,0,3.2-1.4,3.2-3.2v-14     C97.5,41.2,96.1,39.7,94.3,39.7z"></path></g></g></g></svg>`,
    textFillColor: '#171b29'
  },
  delayed: {
    xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" x="0px" y="0px"><title>restore</title><g data-name="Layer 2"><path d="M23.45,76.58A37.52,37.52,0,1,0,25.1,22l5.66-.81a2.5,2.5,0,1,1,.71,4.95L18.26,28l-.35,0a2.49,2.49,0,0,1-2.47-2.85L17.32,12a2.5,2.5,0,1,1,4.95.71l-.84,5.87a42.5,42.5,0,1,1-1.51,61.57,2.5,2.5,0,0,1,3.53-3.53ZM50,24.74a2.5,2.5,0,0,0-2.5,2.5V50a2.49,2.49,0,0,0,.73,1.77L62.44,66A2.5,2.5,0,1,0,66,62.45L52.49,49V27.24A2.5,2.5,0,0,0,50,24.74Z"/></g><text x="0" y="115" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by iconnut</text><text x="0" y="120" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`,
    textFillColor: '#000000'
  },
  payPerview: {
    xml: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 48 60" enable-background="new 0 0 48 48" xml:space="preserve"><g><path d="M24,46C11.9,46,2,36.1,2,24C2,11.9,11.9,2,24,2c12.1,0,22,9.9,22,22c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1C48,10.8,37.2,0,24,0   S0,10.8,0,24s10.8,24,24,24c0.6,0,1-0.4,1-1C25,46.4,24.6,46,24,46z"/><path d="M24,41c-9.4,0-17-7.6-17-17c0-9.4,7.6-17,17-17s17,7.6,17,17c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1c0-10.5-8.5-19-19-19   C13.5,5,5,13.5,5,24c0,10.5,8.5,19,19,19c0.6,0,1-0.4,1-1C25,41.4,24.6,41,24,41z"/><path d="M24,16.4c1.8,0,3.3,1.5,3.3,3.3c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1c0-2.6-1.9-4.7-4.3-5.2v-1.1c0-0.6-0.4-1-1-1   c-0.6,0-1,0.4-1,1v1.1c-2.4,0.5-4.3,2.6-4.3,5.2c0,2.9,2.4,5.3,5.3,5.3c1.8,0,3.3,1.5,3.3,3.3c0,1.8-1.5,3.3-3.3,3.3   c-1.8,0-3.3-1.5-3.3-3.3c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1c0,2.6,1.9,4.7,4.3,5.2v1.1c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1v-1.1   c2.4-0.5,4.3-2.6,4.3-5.2c0-2.9-2.4-5.3-5.3-5.3c-1.8,0-3.3-1.5-3.3-3.3S22.2,16.4,24,16.4z"/><path d="M40.9,39.5l3.5-3.5c0.2-0.2,0.3-0.6,0.3-0.9c-0.1-0.3-0.3-0.6-0.7-0.7l-12.7-4.2c-0.4-0.1-0.8,0-1,0.2   c-0.3,0.3-0.4,0.7-0.2,1l4.2,12.7c0.1,0.3,0.4,0.6,0.7,0.7c0.1,0,0.2,0,0.2,0c0.3,0,0.5-0.1,0.7-0.3l3.5-3.5l6.8,6.8   c0.2,0.2,0.5,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L40.9,39.5z M35.7,41.9l-3.1-9.3l9.3,3.1L35.7,41.9z"/></g><text x="0" y="63" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Vectors Market</text><text x="0" y="68" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`,
    textFillColor: '#000000'
  },
  noun_tick: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 7.1628 7.1628" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs><style type="text/css">
    .fil0 {fill:#171b29;fill-rule:nonzero}
  </style></defs><g><path class="fil0" d="M3.5814 0c-1.9781,0 -3.5814,1.6033 -3.5814,3.5814 0,1.9781 1.6033,3.5814 3.5814,3.5814 1.9781,0 3.5814,-1.6033 3.5814,-3.5814 0,-0.7775 -0.2478,-1.497 -0.6686,-2.0841l-2.6492 3.3494c-0.1248,0.1929 -0.405,0.2094 -0.55,0.0262l-1.6679 -2.1114c-0.2746,-0.3476 0.2546,-0.7656 0.5292,-0.418l1.4043 1.7757 2.4827 -3.1388c-0.6417,-0.6076 -1.5083,-0.9804 -2.4619,-0.9804z"></path></g></svg>`,
    textFillColor: '#000000'
  },
  noun_signout: {
    xml: `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
    >
      <path
        fill="#171B29"
        fillRule="nonzero"
        d="M3.214 0h11.572C17.33 0 18 2.102 18 3.214v1.929c0 .353-.29.643-.643.643a.646.646 0 01-.643-.643V3.22c-.006-.328-.115-1.935-1.928-1.935H3.22c-.328.006-1.935.115-1.935 1.928V14.78c.006.328.115 1.935 1.928 1.935H14.78c.328-.006 1.935-.115 1.935-1.928v-1.929c0-.353.29-.643.643-.643.354 0 .643.29.643.643v1.929C18 17.33 15.898 18 14.786 18H3.214C.67 18 0 15.898 0 14.786V3.214C0 .67 2.102 0 3.214 0zm8.068 4.61a.634.634 0 00-.887.18.634.634 0 00.18.886c1.337.894 2.597 1.968 3.195 2.681H4.5A.645.645 0 003.857 9c0 .354.29.643.643.643h9.27c-.598.713-1.858 1.787-3.195 2.68a.636.636 0 00-.18.888.642.642 0 00.534.289.596.596 0 00.353-.11c1.247-.829 4.147-2.918 4.147-4.39 0-1.472-2.9-3.561-4.147-4.39z"
      ></path>
    </svg>`,
    textFillColor: '#171B29'
  },
  nounEyeCross: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" x="0px" y="0px"><title>location, park, venue, eye_1</title><path d="M28.86,15.49a28.29,28.29,0,0,0-5-6l1.83-1.83a1,1,0,1,0-1.42-1.42l-2,2A11,11,0,0,0,16,6C8.89,6,3.37,15.1,3.14,15.49a1,1,0,0,0,0,1,28.29,28.29,0,0,0,5,5.95L6.29,24.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l2-2A11,11,0,0,0,16,26c7.11,0,12.63-9.1,12.86-9.49A1,1,0,0,0,28.86,15.49ZM5.19,16C6.41,14.16,10.89,8,16,8a8.81,8.81,0,0,1,4.87,1.72L16.5,14.09a3.73,3.73,0,0,1-.5-1.84A3.88,3.88,0,0,1,16.22,11L16,11a5,5,0,0,0-4.17,7.75l-2.29,2.3A27,27,0,0,1,5.19,16ZM16,24a8.81,8.81,0,0,1-4.87-1.72l2.12-2.11A5,5,0,0,0,21,16c0-.08,0-.15,0-.22a3.88,3.88,0,0,1-1.23.22,3.73,3.73,0,0,1-1.84-.5L22.46,11A27,27,0,0,1,26.81,16C25.59,17.84,21.11,24,16,24Z"></path></svg>`,
    textFillColor: `#171b29`
  },
  nounEye: {
    xml: `<svg height='100px' width='100px'  fill="#171b29" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" x="0px" y="0px"><title>location, park, venue, eye</title><path d="M28.86,15.49C28.63,15.1,23.11,6,16,6S3.37,15.1,3.14,15.49a1,1,0,0,0,0,1C3.37,16.9,8.89,26,16,26s12.63-9.1,12.86-9.49A1,1,0,0,0,28.86,15.49ZM16,24c-5.11,0-9.59-6.16-10.81-8C6.41,14.16,10.88,8,16,8s9.59,6.16,10.81,8C25.59,17.84,21.12,24,16,24Z"></path><path d="M19.75,16A3.75,3.75,0,0,1,16,12.25,3.88,3.88,0,0,1,16.22,11L16,11a5,5,0,1,0,5,5c0-.08,0-.15,0-.22A3.88,3.88,0,0,1,19.75,16Z"></path></svg>`,
    textFillColor: `#171b29`
  },
  nextIcon: {
    xml: `<svg width="9" height="17" viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L8 8.99643L1 16" stroke="#57E1F1"/>
    </svg>`,
    textFillColor: `#57E1F1`
  },
  circleClose: {
    xml: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><script/>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(1 1)">
      <g>
        <g>
          <path d="M436.016,73.984c-99.979-99.979-262.075-99.979-362.033,0.002c-99.978,99.978-99.978,262.073,0.004,362.031     c99.954,99.978,262.05,99.978,362.029-0.002C535.995,336.059,535.995,173.964,436.016,73.984z M405.848,405.844     c-83.318,83.318-218.396,83.318-301.691,0.004c-83.318-83.299-83.318-218.377-0.002-301.693     c83.297-83.317,218.375-83.317,301.691,0S489.162,322.549,405.848,405.844z" fill="#ffffff" data-original="#000000" style="" class=""/>
          <path d="M360.592,149.408c-8.331-8.331-21.839-8.331-30.17,0l-75.425,75.425l-75.425-75.425c-8.331-8.331-21.839-8.331-30.17,0     s-8.331,21.839,0,30.17l75.425,75.425L149.43,330.4c-8.331,8.331-8.331,21.839,0,30.17c8.331,8.331,21.839,8.331,30.17,0     l75.397-75.397l75.419,75.419c8.331,8.331,21.839,8.331,30.17,0c8.331-8.331,8.331-21.839,0-30.17l-75.419-75.419l75.425-75.425     C368.923,171.247,368.923,157.74,360.592,149.408z" fill="#ffffff" data-original="#000000" style="" class=""/>
        </g>
      </g>
    </g>
    </g></svg>`,
    textFillColor: `#ffffff`
  }
};

export default class SvgIcon extends Component {
  setRefIcon = this.setRefIcon.bind(this);
  setRefIcon(ref) {
    if (ref) {
      this.refIcon = ref;
    }
  }
  render() {
    const {
      name,
      size,
      color,
      onPress,
      style,
      disabled,
      setRef,
      timeDelay = ENUM.TIME_DELAY,
      ...rest
    } = this.props;
    const { xml, textFillColor } = objInfo[name] || {};
    if (!xml) return null;

    const customXml = color
      ? _.replace(xml, new RegExp(textFillColor, 'g'), color)
      : xml;
    return (
      <View collapsable={false} ref={this.setRefIcon} style={style}>
        <TouchableOpacityOpt
          timeDelay={timeDelay}
          setRef={setRef}
          onPress={() => onPress(this.refIcon)}
          disabled={disabled || !onPress}
          {...rest}
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <View style={{ width: size, height: size }}>
            <SvgXml xml={customXml} width="100%" height="100%" />
          </View>
        </TouchableOpacityOpt>
      </View>
    );
  }
}

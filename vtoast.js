/*
 * MIT License
 *
 * Vanilla Toasts (vtoasts) 0.3.0alpha - Copyright (c) 2020 Noah Boegli
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class vtoast {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Core functions
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Shows a toast. To see possible combination of parameters, see the documentation.
     */
    static show() {

        /*********** <Parsing arguments> ***********/
        let args;
        try {
            args = vtoast.parseArgs(arguments);
        } catch (exception) {
            throw exception;
        }

        let content = args["content"];
        let title = args["title"];
        let options = args["options"];
        /*********** </Parsing arguments> ***********/


        /*********** <DOM Elements creation> ***********/
        let toastElement = document.createElement("div");

        let progressbarElement;
        switch (options["progress"]) {
            case "top":
            case "bottom":
                progressbarElement = document.createElement("div");
                progressbarElement.classList.add("progress");
                break;
            case "hidden":
                break;
            default:
                throw "vtoast: error, incorrect value " + options["progress"] + " given for progress bar type.";
        }
        toastElement.progressbarType = options["progress"];

        if (options["progress"] === "top") {
            toastElement.append(progressbarElement);
        }

        toastElement.innerHTML += `<div class="content"> <span class="title">${title}</span> ${content}</div>`;

        if (options["progress"] === "bottom") {
            toastElement.append(progressbarElement);
        }

        toastElement.classList.add("vtoast", "hidden");

        document.documentElement.append(toastElement);
        /*********** </DOM Elements creation> ***********/


        /*********** <Styling> ***********/
            //Positioning the element
        let position = options["position"].split("-");
        let vPosition = position[0];
        let hPosition = position[1];

        switch (vPosition) {
            case "top":
                toastElement.style.top = "0";
                break;
            case "middle":
                toastElement.style.top = "calc(50vh - (" + toastElement.offsetHeight + "px / 2) - " + options["margin"] + "px)";
                break;
            case "bottom":
                toastElement.style.bottom = "0";
                break;
            default:
                console.log("vtoast: error, unknown vertical position attribute " + vPosition + ".");
                return;
        }

        switch (hPosition) {
            case "left":
                toastElement.style.left = "0";
                break;
            case "centre":
                toastElement.style.left = "calc(50vw - (" + options["width"] + "px / 2) - " + options["margin"] + "px)";
                break;
            case "right":
                toastElement.style.right = "0";
                break;
            default:
                console.log("vtoast: error, unknown horizontal position attribute " + hPosition + ".");
                return;
        }

        // Width, margin
        toastElement.style.width = options["width"] + "px";
        toastElement.style.margin = options["margin"] + "px";

        //Adding colors
        toastElement.style.color = options["color"];
        toastElement.style.backgroundColor = options["background-color"];
        /*********** </Styling> ***********/


        /*********** <Auto-remove> ***********/
        // Adding a timeout to automatically remove the toast after the given delay
        toastElement.autoRemove = setTimeout(function () {
            vtoast.removeToast(toastElement);
        }, options["duration"]);


        // Mouse enter event, we must stop the auto-remove process
        toastElement.addEventListener("mouseenter", function () {
            //Clearing the timeout on the toast
            clearTimeout(toastElement.autoRemove);


            // Stopping the progress bar width animation by setting the width to the current width
            if (toastElement.hasOwnProperty("progressbarType"))
                progressbarElement.style.width = progressbarElement.clientWidth + "px";

        });

        // Mouse leave event, we must restart the auto-remove process
        toastElement.addEventListener("mouseleave", function () {

            //Resetting width and adapting transition duration
            if (toastElement.hasOwnProperty("progressbarType")){
                progressbarElement.style.transition = "width " + (options["unfocus-duration"] / 1000) + "s linear";
                progressbarElement.style.width = "0";
            }

            //Setting a timeout to remove the toast after the delay is over.
            toastElement.autoRemove = setTimeout(function () {
                vtoast.removeToast(toastElement);
            }, options["unfocus-duration"]);
        });
        /*********** </Auto-remove> ***********/


        /*********** <Progressbar animation> ***********/
        if (toastElement.hasOwnProperty("progressbarType")) {
            if (toastElement.progressbarType === "top") {
                window.requestAnimationFrame(function () {
                    toastElement.children[0].style.transition = "width " + (options["duration"] / 1000) + "s linear";
                    toastElement.children[0].style.width = "0";
                });
            } else if (toastElement.progressbarType === "bottom") {
                let toastChildren = toastElement.children;
                window.requestAnimationFrame(function () {
                    toastChildren[toastChildren.length - 1].style.transition = "width " + (options["duration"] / 1000) + "s linear";
                    toastChildren[toastChildren.length - 1].style.width = "0";
                });
            }
        }
        /*********** </Progressbar animation> ***********/


        /*********** <Moving other toasts out of the way> ***********/
        for (let toast of vtoast.toasts[vPosition + "-" + hPosition]) {
            if (vPosition === "top") {
                let currentTop = toast.style.top;
                toast.style.top = (Number(currentTop.substring(0, currentTop.length - 2)) + toastElement.offsetHeight + options["margin"]) + "px";
            } else if (vPosition === "middle") {
                let currentTop = toast.style.top;
                toast.style.top = currentTop.substring(0, currentTop.length - 1) + " + " + (toastElement.offsetHeight + options["margin"]) + "px)";
            } else if (vPosition === "bottom") {
                let currentBottom = toast.style.bottom;
                toast.style.bottom = (Number(currentBottom.substring(0, currentBottom.length - 2)) + toastElement.offsetHeight + options["margin"]) + "px";
            }
        }
        /*********** </Moving other toasts out of the way> ***********/


        /*********** <Finishing> ***********/
        //Showing the toast
        toastElement.classList.add("shown");
        toastElement.classList.remove("hidden");


        //Adding the toast in the toast list
        vtoast.toasts[vPosition + "-" + hPosition].push(toastElement);
        /*********** </Finishing> ***********/
    }

    /**
     * Parses the arguments for the show method.
     * @param args the argument array
     * @returns an object containing the content, title and options with the keys in the previously given order.
     */
    static parseArgs(args) {
        /*********** <Default values> ***********/
        let title = "";
        let content = "";
        let options = vtoast.options;
        /*********** </Default values> ***********/


        /*********** <Parsing arguments> ***********/
        if (args.length === 1) {
            content = args[0];
        } else if (args.length === 2) {
            title = args[0];
            content = args[1];
        } else if (args.length === 3) {
            title = args[0];
            content = args[1];
            options = {...options, ...args[2]};
        } else {
            throw "vtoast: error, incorrect argument count, expected 1, 2 or 3. " + args.length + " given.";
        }
        /*********** </Parsing arguments> ***********/

        return {
            "content": content,
            "title": title,
            "options": options
        };
    }

    static removeToast(toast) {
        toast.classList.add("hidden");
        toast.classList.remove("shown");

        setTimeout(function () {
            toast.remove();
        }, 700);
    }
}

let placeHolder = document.createElement("i");

vtoast.toasts = {
    "top-left": [placeHolder],
    "top-centre": [placeHolder],
    "top-right": [placeHolder],
    "middle-left": [placeHolder],
    "middle-centre": [placeHolder],
    "middle-right": [placeHolder],
    "bottom-left": [placeHolder],
    "bottom-centre": [placeHolder],
    "bottom-right": [placeHolder],
};

vtoast.options = {
    "width": 350,
    "margin": 10,
    "color": "#FFFFFF",
    "background-color": "#007BFF",
    "duration": 5000,
    "unfocus-duration": 1000,
    "position": "top-right",
    "show-close": false,
    "progress": "hidden"
};
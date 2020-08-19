/*
 * MIT License
 *
 * Vanilla Toasts (vtoast) 1.0.0 - Copyright (c) 2020
 * Authors: Paper Development - Noah Boegli
 * All rights reserved
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
    // Public functions
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Shows a toast, handles the multiple arguments combination. To see more about the possible combination, see
     * [the documentation](https://github.com/paper-development/vanilla-toasts).
     */
    static show() {
        /*********** <Parsing arguments> ***********/
        let args;
        try {
            args = vtoast._parseArgs(arguments);
        } catch (exception) {
            throw exception;
        }

        let content = args["content"];
        let title = args["title"];
        let options = args["options"];
        /*********** </Parsing arguments> ***********/

        /*********** <Showing the toast> ***********/
        try {
            vtoast._show(title, content, options)
        } catch (exception) {
            throw exception;
        }
        /*********** </Showing the toast> ***********/
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Shows a toast.
     * @param title The toast title
     * @param text The toast text
     * @param options The toast options
     * @private
     */
    static _show(title, text, options) {

        /*********** <DOM Elements creation> ***********/
        let toast = vtoast._createToastElement(title, text, options)
        document.documentElement.append(toast);
        /*********** </DOM Elements creation> ***********/

        /*********** <Positioning> ***********/
        let position = options["position"].split("-");
        let vPosition = position[0];
        let hPosition = position[1];

        switch (vPosition) {
            case "top":
                toast.style.top = "0";
                break;
            case "middle":
                toast.style.top = "calc(50vh - (" + toast.offsetHeight + "px / 2) - " + options["margin"] + "px)";
                break;
            case "bottom":
                toast.style.bottom = "0";
                break;
            default:
                throw "vtoast: error, unknown vertical position attribute " + vPosition + ".";
        }

        switch (hPosition) {
            case "left":
                toast.style.left = "0";
                break;
            case "centre":
                toast.style.left = "calc(50vw - (" + options["width"] + "px / 2) - " + options["margin"] + "px)";
                break;
            case "right":
                toast.style.right = "0";
                break;
            default:
                throw "vtoast: error, unknown horizontal position attribute " + hPosition + ".";
        }
        toast.style.width = options["width"] + "px";
        toast.style.margin = options["margin"] + "px";
        /*********** </Positioning> ***********/

        /*********** <Appearance> ***********/
        toast.style.color = options["color"];
        toast.style.backgroundColor = options["backgroundcolor"];
        toast.style.opacity = options["opacity"];
        /*********** </Appearance> ***********/

        /*********** <Auto-remove> ***********/
        vtoast._remove(toast, options["duration"]);

        // Mouse enter event, we must stop the auto-remove process
        toast.addEventListener("mouseenter", function () {

            //Clearing the timeout on the toast
            vtoast._cancelRemove(toast);

            // Stopping the progress bar width animation by setting the width to the current width
            if (toast.progressbarType !== "hidden")
                toast.progressbarElement.style.width = toast.progressbarElement.clientWidth + "px";
        });

        // Mouse leave event, we must restart the auto-remove process
        toast.addEventListener("mouseleave", function () {

            //Resetting width and adapting transition duration
            if (toast.progressbarType !== "hidden") {
                window.requestAnimationFrame(function () {
                    toast.progressbarElement.style.transition = "width " + (options["unfocusduration"] / 1000) + "s linear";
                    toast.progressbarElement.style.width = "0";
                });
            }

            //Setting a timeout to remove the toast after the delay is over.
            vtoast._remove(toast, options["unfocusduration"]);
        });
        /*********** </Auto-remove> ***********/

        /*********** <Progressbar animation> ***********/
        if (toast.progressbarType !== "hidden") {
            window.requestAnimationFrame(function () {
                toast.progressbarElement.style.transition = "width " + (options["duration"] / 1000) + "s linear";
                toast.progressbarElement.style.width = "0";
            });
        }
        /*********** </Progressbar animation> ***********/

        /*********** <Moving other toasts out of the way> ***********/
        for (let toast of vtoast.toasts[vPosition + "-" + hPosition]) {
            if (vPosition === "top") {
                let currentTop = toast.style.top;
                toast.style.top = (Number(currentTop.substring(0, currentTop.length - 2)) + toast.offsetHeight + options["margin"]) + "px";
            } else if (vPosition === "middle") {
                let currentTop = toast.style.top;
                toast.style.top = currentTop.substring(0, currentTop.length - 1) + " + " + (toast.offsetHeight + options["margin"]) + "px)";
            } else if (vPosition === "bottom") {
                let currentBottom = toast.style.bottom;
                toast.style.bottom = (Number(currentBottom.substring(0, currentBottom.length - 2)) + toast.offsetHeight + options["margin"]) + "px";
            }
        }
        /*********** </Moving other toasts out of the way> ***********/

        /*********** <Finishing> ***********/
        //Showing the toast
        window.requestAnimationFrame(function () {
            toast.classList.remove("hidden");
        });

        //Adding the toast in the toast list
        vtoast.toasts[vPosition + "-" + hPosition].push(toast);
        /*********** </Finishing> ***********/
    }

    /**
     * Creates a toast DOM element ready to be used.
     * What is done, in details: Elements hierarchy creation, classes addition, progressbar & close button.
     * What is **not** done: All options, except for the close button and the progressbar.
     * @param title The toast title
     * @param text The toast text
     * @param options The toast options
     * @returns {HTMLDivElement}
     * @private
     */
    static _createToastElement(title, text, options) {

        let toastContainer = document.createElement("div");
        let contentContainer = document.createElement("div")
        let titleContainer = document.createElement("span");

        if (options["showclose"]) {
            let closeButtonElement = document.createElement("i");
            closeButtonElement.classList.add("close-button");
            toastContainer.closeButtonElement = closeButtonElement;
        }

        if (options["progressbar"] !== "hidden") {
            let progressBarElement = document.createElement("div");
            progressBarElement.classList.add("progressbar");
            toastContainer.progressbarElement = progressBarElement;
            toastContainer.progressbarType = options["progressbar"];
        }

        toastContainer.classList.add("vtoast", "hidden");
        contentContainer.classList.add("content");
        titleContainer.classList.add("title");

        if (options["showclose"])
            toastContainer.append(toastContainer.closeButtonElement);

        if (options["progressbar"] === "top")
            toastContainer.append(toastContainer.progressbarElement);

        titleContainer.innerHTML = title;
        contentContainer.append(titleContainer);
        contentContainer.innerHTML += text;

        toastContainer.append(contentContainer);

        if (options["progressbar"] === "bottom")
            toastContainer.append(toastContainer.progressbarElement);

        return toastContainer;
    }

    /**
     * Parses the arguments for the show method.
     * @param args The argument array
     * @returns An object containing the content, title and options with the keys in the previously given order.
     * @private
     */
    static _parseArgs(args) {
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

    /**
     * Removes a toast.
     * @param toast The toast to remove.
     * @param delay The delay (in ms) before the removal.
     * @private
     */
    static _remove(toast, delay) {
        toast.removeTimeout = setTimeout(function () {
            toast.classList.add("hidden");

            setTimeout(function () {
                toast.remove();
            }, 700);
        }, delay);
    }

    /**
     * Cancels a toast removal.
     * @param toast The toast to cancel the removal on.
     * @private
     */
    static _cancelRemove(toast) {
        clearTimeout(toast.removeTimeout);
    }
}

// This property holds all the toasts
vtoast.toasts = {
    "top-left": [], "top-centre": [], "top-right": [],
    "middle-left": [], "middle-centre": [], "middle-right": [],
    "bottom-left": [], "bottom-centre": [], "bottom-right": [],
};

// Default options
vtoast.options = {
    "width": 350,
    "margin": 10,
    "color": "#FFFFFF",
    "backgroundcolor": "#007BFF",
    "duration": 5000,
    "unfocusduration": 1000,
    "position": "top-right",
    "showclose": false,
    "progressbar": "hidden",
    "opacity": "1"
};
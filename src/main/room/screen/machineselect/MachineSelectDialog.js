// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

wmsx.MachineSelectDialog = function(mainElement, machineTypeSocket) {
"use strict";

    var self = this;

    this.show = function () {
        if (!dialog) {
            create();
            return setTimeout(self.show, 0);
        }

        visible = true;
        machineSelected = machineTypeSocket.getMachine();
        dialog.classList.add("wmsx-show");
        dialog.focus();
        refreshList();

        var availHeight = mainElement.clientHeight - wmsx.ScreenGUI.BAR_HEIGHT - 20;      //  bar - tolerance
        var height = dialog.clientHeight;
        var scale = height < availHeight ? 1 : availHeight / height;
        dialog.style.transform = "translateY(-" + ((wmsx.ScreenGUI.BAR_HEIGHT / 2) | 0) + "px) scale(" + scale.toFixed(4) + ")";

        //console.error("MACHINE SEL SCALE availHeight: " + availHeight + ", height: " + height + ", final: " + height * scale);
    };

    this.hide = function (confirm) {
        dialog.classList.remove("wmsx-show");
        visible = false;
        WMSX.room.screen.focus();
        if (confirm) machineTypeSocket.changeMachine(machineSelected);
    };

    function refreshList() {
        for (var i = 0; i < listItems.length; ++i) {
            var li = listItems[i];
            li.classList.toggle("wmsx-selected", li.wmsxMachine === machineSelected);
        }
    }

    function create() {
        dialog = document.createElement("div");
        dialog.id = "wmsx-machineselect";
        dialog.classList.add("wmsx-select-dialog");
        dialog.style.width = "280px";
        dialog.style.height = "319px";
        dialog.tabIndex = -1;

        var header = document.createTextNode("Select Machine");
        dialog.appendChild(header);

        // Define list
        list = document.createElement('ul');
        list.style.width = "80%";

        for (var i = 0; i < machines.length; ++i) {
            if (!WMSX.MACHINES_CONFIG[machines[i]].type) continue;       // Exclude EMPTY and AUTO options from list
            var li = document.createElement("li");
            li.classList.add("wmsx-visible");
            li.style.textAlign = "center";
            li.innerHTML = WMSX.MACHINES_CONFIG[machines[i]].desc;
            li.wmsxMachine = machines[i];
            listItems.push(li);
            list.appendChild(li);
        }
        dialog.appendChild(list);

        setupEvents();

        mainElement.appendChild(dialog);
    }

    function setupEvents() {
        function hideAbort()   { self.hide(false); }
        function hideConfirm() { self.hide(true); }

        // Trap keys, respond to some
        dialog.addEventListener("keydown", function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Abort
            if (e.keyCode === ESC_KEY) hideAbort();
            // Confirm
            else if (CONFIRM_KEYS.indexOf(e.keyCode) >= 0) hideConfirm();
            // Select
            else if (SELECT_KEYS[e.keyCode]) {
                var idx = machines.indexOf(machineSelected) + SELECT_KEYS[e.keyCode];
                var newMachine = machines[idx];
                if (newMachine && WMSX.MACHINES_CONFIG[newMachine].type) {      // Exclude EMPTY and AUTO options
                    machineSelected = newMachine;
                    refreshList();
                }
            }

            return false;
        });

        // Hide on lost focus
        if ("onblur" in document) dialog.addEventListener("blur", hideAbort, true);
        else dialog.addEventListener("focusout", hideAbort, true);

        // Select with mousedown
        list.addEventListener("mousedown", function mouseDownDiskSelect(e) {
            e.stopPropagation();
            if (e.button === 0 && e.target.wmsxMachine) {
                machineSelected = e.target.wmsxMachine;
                refreshList();
                setTimeout(hideConfirm, 160);
            }
            return false;
        });

        // Supress context menu
        dialog.addEventListener("contextmenu", function stopContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }


    var machines = Object.keys(WMSX.MACHINES_CONFIG);
    var machineSelected;

    var dialog, list;
    var listItems = [];
    var visible = false;

    var k = wmsx.DOMKeys;
    var ESC_KEY = k.VK_ESCAPE.c;
    var CONFIRM_KEYS = [ k.VK_ENTER.c, k.VK_SPACE.c ];
    var SELECT_KEYS = {};
        SELECT_KEYS[k.VK_UP.c] = -1;
        SELECT_KEYS[k.VK_DOWN.c] = 1;

};
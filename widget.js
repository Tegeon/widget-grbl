// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-grbl-new"], function (grbl) {
    //console.log("test running of " + grbl.id);
    grbl.init();
    //testRecvline();
    
    var sendGrblVersion = function() {
        chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {
            dataline: "Grbl 0.8c"
        });
    };
    
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$0=755.906 (x, step/mm)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$1=755.906 (y, step/mm)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$13=0 (report mode, 0=mm,1=inch)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$3=30 (step pulse, usec)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$5=500.000 (default feed, mm/min)\n" });
    
    chilipeppr.publish("/com-chilipeppr-widget-3dviewer/unitsChanged","inch");
    
    var sendTestPositionData = function() {
        setTimeout(function() {
            // MPos:[-0.05,0.00,0.00],WPos:[-0.05,0.00,0.00]
            chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", { 
                //dataline: "MPos:[-0.05,0.00,0.00],WPos:[-0.05,0.200,-1.00]"  //0.8a            
                dataline: "<idle,MPos:-0.05,0.00,0.00,WPos:-0.05,0.200,-1.00>"  //0.8c
            });
        }, 2000);
        
    };
    sendGrblVersion();
    sendTestPositionData();
    
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvSingleSelectPort",{BufferAlgorithm: "grbl"}); //error not grbl buffer

} /*end_test*/ );

function Queue(){var e=[];var t=0;this.getLength=function(){return e.length-t};this.isEmpty=function(){return e.length==0};this.enqueue=function(t){e.push(t)};this.dequeue=function(){if(e.length==0)return undefined;var n=e[t];if(++t*2>=e.length){e=e.slice(t);t=0}return n};this.peek=function(){return e.length>0?e[t]:undefined};this.sum=function(){for(var t=0,n=0;t<e.length;n+=e[t++]);return n};this.last=function(){return e[e.length-1]}}

cpdefine("inline:com-chilipeppr-widget-grbl-new", ["chilipeppr_ready", "jquerycookie"], function () {
    return {
        id: "com-chilipeppr-widget-grbl-new",
        implements: { 
            "com-chilipeppr-interface-cnccontroller" : "The CNC Controller interface is a loosely defined set of publish/subscribe signals. The notion of an interface is taken from object-oriented programming like Java where an interface is defined and then specific implementations of the interface are created. For the sake of a Javascript mashup like what ChiliPeppr is, the interface is just a rule to follow to publish signals and subscribe to signals by different top-level names than the ID of the widget or element implementing the interface. Most widgets/elements will publish and subscribe on their own ID. In this widget we are publishing/subscribing on an interface name. If another controller like Grbl is defined by a member of the community beyond this widget for GRBL, this widget can be forked and used without other widgets needing to be changed and the user could pick a Grbl or GRBL implementation of the interface."
        },
		url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        name: "Widget / GRBL",
        desc: "This widget shows the GRBL Buffer so other widgets can limit their flow of sending commands and other specific GRBL features.",
        publish: {
            '/com-chilipeppr-interface-cnccontroller/feedhold' : "Feedhold (Emergency Stop). This signal is published when user hits the Feedhold button for an emergency stop of the GRBL. Other widgets should see this and stop sending all commands such that even when the plannerresume signal is received when the user clears the queue or cycle starts again, they have to manually start sending code again. So, for example, a Gcode sender widget should place a pause on the sending but allow user to unpause.",
            '/com-chilipeppr-interface-cnccontroller/plannerpause' : "This widget will publish this signal when it determines that the planner buffer is too full on the GRBL and all other elements/widgets need to stop sending data. You will be sent a /plannerresume when this widget determines you can start sending again. The GRBL has a buffer of 28 slots for data. You want to fill it up with around 12 commands to give the planner enough data to work on for optimizing velocities of movement. However, you can't overfill the GRBL or it will go nuts with buffer overflows. This signal helps you fire off your data and not worry about it, but simply pause the sending of the data when you see this signal. This signal does rely on the GRBL being in {qv:2} mode which means it will auto-send us a report on the planner every time it changes. This widget watches for those changes to generate the signal. The default setting is when we hit 12 remaining planner buffer slots we will publish this signal.",
            '/com-chilipeppr-interface-cnccontroller/plannerresume' : "This widget will send this signal when it is ok to send data to the GRBL again. This widget watches the {qr:[val]} status report from the GRBL to determine when the planner buffer has enough room in it to send more data. You may not always get a 1 to 1 /plannerresume for every /plannerpause sent because we will keep sending /plannerpause signals if we're below threshold, but once back above threshold we'll only send you one /plannerresume. The default setting is to send this signal when we get back to 16 available planner buffer slots.",
            '/com-chilipeppr-interface-cnccontroller/axes' : "This widget will normalize the GRBL status report of axis coordinates to send off to other widgets like the XYZ widget. The axes publish payload contains {x:float, y:float, z:float, a:float} If a different CNC controller is implemented, it should normalize the coordinate status reports like this model. The goal of this is to abstract away the specific controller implementation from generic CNC widgets.",
            '/com-chilipeppr-interface-cnccontroller/units' : "This widget will normalize the GRBL units to the interface object of units {units: \"mm\"} or {units: \"inch\"}. This signal will be published on load or when this widget detects a change in units so other widgets like the XYZ widget can display the units for the coordinates it is displaying.",
            '/com-chilipeppr-interface-cnccontroller/proberesponse': 'Publish a probe response with the coordinates triggered during probing, or an alarm state if the probe does not contact a surface',
            '/com-chilipeppr-interface-cnccontroller/status' : 'Publish a signal each time the GRBL status changes'
        },
        subscribe: {
            '/com-chilipeppr-interface-cnccontroller/jogdone' : 'We subscribe to a jogdone event so that we can fire off an exclamation point (!) to the GRBL to force it to drop all planner buffer items to stop the jog immediately.',
            '/com-chilipeppr-interface-cnccontroller/recvgcode' : 'Subscribe to receive gcode from other widgets for processing and passing on to serial port'
        },
        foreignPublish: {
            "/com-chilipeppr-widget-serialport/send" : "We send to the serial port certain commands like the initial configuration commands for the GRBL to be in the correct mode and to get initial statuses like planner buffers and XYZ coords. We also send the Emergency Stop and Resume of ! and ~"
        },
        foreignSubscribe: {
            "/com-chilipeppr-widget-serialport/ws/onconnect" : "When we see a new connect, query for status.",
            "/com-chilipeppr-widget-serialport/recvline" : "When we get a dataline from serialport, process it and fire off generic CNC controller signals to the /com-chilipeppr-interface-cnccontroller channel.",
            "/com-chilipeppr-widget-serialport/send" : "Subscribe to serial send and override so no other subscriptions receive command."
        },
        //plannerPauseAt: 128, // grbl planner buffer can handle 128 bytes of data
        //qLength: new Queue(),
        //qLine: new Queue(),
        //g_count: 0,
        //l_count: 0,
        //interval_id: 0,
        config: [],
        //config_index: [],
        buffer_name: "",
        report_mode: 0,
        work_mode: 0,
        status: "Offline",
        version: "",
        offsets: {"x": 0.000, "y": 0.000, "z": 0.000},
        last_work: {"x":0.000, "y": 0.000, "z": 0.000},
        last_machine: {"x":0.000, "y": 0.000, "z": 0.000},
        init: function () {

            this.setupUiFromCookie();
            this.btnSetup();

            this.forkSetup();

            // setup recv pubsub event
            // this is when we receive data in a per line format from the serial port
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, function (msg) {
                this.grblResponse(msg);
            });

            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onportopen", this, this.openController);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onportclose", this, this.closeController);
           
            
            // subscribe to jogdone so we can stop the planner buffer immediately
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/jogdone", this, function (msg) {
                //chilipeppr.publish("/com-chilipeppr-widget-serialport/send", '!\n');
                //this.sendCode('!\n');
                setTimeout(function() {
                    chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', "");
                }, 2);
            });
            
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", this, function(port){
                if(port !== null){
                   this.buffer_name = port.BufferAlgorithm;
                   if(this.buffer_name !== "grbl")
                       $("#grbl-buffer-warning").show();
                   else
                       $("#grbl-buffer-warning").hide();
                }
            });
            
            //no longer following the send.
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush, 1);
            
            //listen for units changed
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/unitsChanged",this,this.updateWorkUnits);
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recvUnits",this,this.updateWorkUnits);
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/units", this, this.updateWorkUnits);
            
            //listen for signal to set work coords
            //chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/setworkcoords",this, function(dat){
            //    chilipeppr.publish("/com-chilipeppr-widget-serialport/send","G92X0Y0Z0\n");
            //});
            
            //listen for signal to run the homing sequence
            //chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/homecnc",this, function(dat){
            //    chilipeppr.publish("/com-chilipeppr-widget-serialport/send","$H\n");
            //});
            
            //call to determine the current serialport configuration
            chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort","");
            
            //call to find out what current work units are
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/requestUnits","");
        },
        options: null,
        setupUiFromCookie: function() {
            // read vals from cookies
            var options = $.cookie('com-chilipeppr-widget-grbl-new-options');
            
            if (true && options) {
                options = $.parseJSON(options);
                //console.log("GRBL: just evaled options: ", options);
            } else {
                options = {showBody: true};
            }
            this.options = options;
            //console.log("GRBL: options:", options);
            
            
        },
        saveOptionsCookie: function() {
            var options = {
                showBody: this.options.showBody
            };
            var optionsStr = JSON.stringify(options);
            //console.log("GRBL: saving options:", options, "json.stringify:", optionsStr);
            // store cookie
            $.cookie('com-chilipeppr-widget-grbl-new-options', optionsStr, {
                expires: 365 * 10,
                path: '/'
            });
        },
        showBody: function(evt) {
            $('#com-chilipeppr-widget-grbl-new .panel-body .stat-row').removeClass('hidden');
            $('#com-chilipeppr-widget-grbl-new .hidebody span').addClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-grbl-new .hidebody span').removeClass('glyphicon-chevron-down');
            if ((evt !== null)) {
                this.options.showBody = true;
                this.saveOptionsCookie();
            }
        },
        hideBody: function(evt) {
            $('#com-chilipeppr-widget-grbl-new .panel-body .stat-row').addClass('hidden');
            $('#com-chilipeppr-widget-grbl-new .hidebody span').removeClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-grbl-new .hidebody span').addClass('glyphicon-chevron-down');
            if ((evt !== null)) {
                this.options.showBody = false;
                this.saveOptionsCookie();
            }
        },
        btnSetup: function() {
            // chevron hide body
            var that = this;
            $('#com-chilipeppr-widget-grbl-new .hidebody').click(function(evt) {
                //console.log("GRBL: hide/unhide body");
                if ($('#com-chilipeppr-widget-grbl-new .panel-body .stat-row').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                } else {
                    // hide
                    that.hideBody(evt);
                }
            });
            $('#com-chilipeppr-widget-grbl-new .grbl-feedhold').click(function() {
                //console.log("GRBL: feedhold");
                that.sendCode('!');
                // announce to other widgets that user hit e-stop
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerpause', "");
                chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/feedhold", "");
            });
            $('#com-chilipeppr-widget-grbl-new .grbl-cyclestart').click(function() {
                //console.log("GRBL: cyclestart");
                that.sendCode('~');
                //may want to check if buffer queue is >128 before resuming planner.
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', ""); 
            });
            
            $('#com-chilipeppr-widget-grbl-new .grbl-verbose').click(function() {
                //console.log("GRBL: manual status update");
                $('#com-chilipeppr-widget-grbl-new .grbl-verbose').toggleClass("enabled");
            });
            
            $('#com-chilipeppr-widget-grbl-new .grbl-reset').click(function() {
                //console.log("GRBL: reset");
                that.sendCode(String.fromCharCode(24));
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', "");
            });

            $('#com-chilipeppr-widget-grbl-new-btnoptions').click(this.showConfigModal.bind(this));
            
            $('#com-chilipeppr-widget-grbl-new .btn-toolbar .btn').popover({
                delay: 500,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });
        },
        showConfigModal: function() {
            $('#grbl-config-div').empty();
            
            this.config.forEach(function(config_element,index_num) {
                $('#grbl-config-div').append('<div class="input-group"  style="width:400px;margin-bottom:2px;"><div class="input-group-addon" style="width:40px;padding:0px 6px;">$' + index_num + '</div><input class="form-control" style="height:20px;padding:0px 6px;width:100px;" id="com-chilipeppr-widget-grbl-new-config-' + index_num +'" value="' + config_element[0] + '"/><span style="margin-left:10px;">' + config_element[1] + '</span></div>');},this);

            $('#grbl-config-div').append('<br/><button class="btn btn-xs btn-default save-config">Save Settings To GRBL</button>');
            $('.save-config').click(this.saveConfigModal.bind(this));
            $('#com-chilipeppr-widget-grbl-new-modal').modal('show');
        },
        hideConfigModal: function() {
            $('#com-chilipeppr-widget-grbl-new-modal').modal('hide');
        },
        saveConfigModal: function() {
            console.log("GRBL: Save Settings");

            this.config.forEach(function(config_element,index_num){
                var command = '$' + index_num + '=' + $('#com-chilipeppr-widget-grbl-new-config-' + index_num).val() + '\n';
                this.config[index_num][0] = $('#com-chilipeppr-widget-grbl-new-config-' + index_num).val();
                this.sendCode(command);
            },this);
            console.log(this.config);
            return true;
        },
        updateWorkUnits: function(units){
            if(units==="mm")
                this.work_mode = 0;
            else if(units==="inch")
                this.work_mode = 1;
            console.log("GRBL: Updated Work Units - " + this.work_mode);
            //update report units if they have changed
            this.updateReportUnits();
        },
        updateReportUnits: function(){
            if(this.config[13] !== undefined){
                if(this.config[13][0] === 0)
                    this.report_mode = 0;
                else if(this.config[13][0] === 1)
                    this.report_mode = 1;
            }
            console.log("GRBL: Updated Report Units - " + this.report_mode);
        },
        //formerly queryControllerForStatus
        openController: function(isWithDelay) {
            var that = this;
            
            //wait three second for arduino initialization before requesting the grbl config variables.
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort",""); //Request port info
                if(that.version === "")
                    that.sendCode("*init*\n"); //send request for grbl init line (grbl was already connected to spjs when chilipeppr loaded and no init was sent back.
                that.sendCode("*status*\n"); //send request for initial status response.
                that.sendCode("$$\n"); //get grbl params
                //wait one additional second before checking for what reporting units grbl is configured for.
                setTimeout(function() {
                    that.updateReportUnits();
                }, 1000);
            }, 3000);
        },
        closeController: function(isWithDelay) {
            $("#grbl-buffer-warning").show();
            this.config = [];
            this.buffer_name = "";
            this.report_mode = 0;
            this.work_mode = 0;
            this.status = "Offline";
            chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/status',this.status);
            $('.com-chilipeppr-grbl-state').text(this.status);
            this.version = "";
            $('#com-chilipeppr-widget-grbl-new .panel-title').text("GRBL");
            this.offsets = {"x": 0.000, "y": 0.000, "z": 0.000};
            this.last_machine= {"x":0.000, "y": 0.000, "z": 0.000};
            this.last_work = {"x":0.000, "y": 0.000, "z": 0.000};
            this.publishAxisStatus({"posx":0.000, "posy":0.000,"posz":0.000});
        },
        grblResponse: function (recvline) {
            //console.log("GRBL: Message Received - " + recvline.dataline);
            if (!(recvline.dataline) || recvline.dataline=='\n') {
                //console.log("GRBL: got recvline but it's not a dataline, so returning.");
                return true;
            }
            
            var msg = recvline.dataline;
            //console.log("GRBL: Line Received -- " + recvline.dataline);
            if (msg.indexOf("ok") >= 0 || msg.indexOf("error") >= 0) { //expected response
                //do something with error response??
            }
            else{ //when response isn't an ok or error, it's actionable information
                if(msg.indexOf("PRB:") >= 0){
                    var coords = msg.replace(/\[PRB:|\]|\n/g,"").replace(/:/g,",").split(",");
                    //use current offsets to bring this value back to work coordinate system for proberesponse.
                    if(this.work_mode===this.report_mode)
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":parseFloat(coords[0]) - this.offsets.x,"y":parseFloat(coords[1]) - this.offsets.y,"z":parseFloat(coords[2]) - this.offsets.z, status: coords[3]});
                    else if(this.work_mode===1 && this.report_mode===0) //work is inch, reporting in mm
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":this.toInch(parseFloat(coords[0]) - this.offsets.x),"y":this.toInch(parseFloat(coords[1]) - this.offsets.y),"z":this.toInch(parseFloat(coords[2]) - this.offsets.z), status: coords[3]});
                    else if(this.work_mode===0 && this.report_mode===1) //work is mm, reporting in inches
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":this.toMM(parseFloat(coords[0]) - this.offsets.x),"y":this.toMM(parseFloat(coords[1]) - this.offsets.y),"z":this.toMM(parseFloat(coords[2]) - this.offsets.z), status: coords[3]});
                }
                else if(msg.indexOf("<") >= 0 && msg.indexOf(">") >= 0){ //if the response is a status message, parse for all possible values
                    //remove brackets
                    msg = msg.replace(/<|>|\[|\]|\n/g, ""); 
                    //change colons to commas & split string
                    rpt_array = msg.replace(/:/g, ",").split(",");
                    
                    if(this.version === '0.8a')
                        $('.com-chilipeppr-grbl-state').text("Too Old - Upgrade GRBL!");
                    else
                        if(rpt_array[0] !== this.status){
                            this.status = rpt_array[0];
                            chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/status',this.status);
                            $('.com-chilipeppr-grbl-state').text(this.status); //Update UI
                        }
                    
                    var len = rpt_array.length;
                    var i = 1;
                    var MPos_flag = false;
                    var WPos_flag = false;
                    while (i < len) {
                        if(rpt_array[i] == "MPos"){
                            this.last_machine.x = rpt_array[i+1];
                            this.last_machine.y = rpt_array[i+2];
                            this.last_machine.z = rpt_array[i+3];

                            MPos_flag = true;
                            i += 4; //increment i counter past the MPos values
                        }
                        else if(rpt_array[i] == "WPos"){
                            this.last_work.x = rpt_array[i+1];
                            this.last_work.y = rpt_array[i+2];
                            this.last_work.z = rpt_array[i+3];

                            WPos_flag = true;
                            i += 4;
                        }
                        else if(rpt_array[i] == "Buf")
                            i += 2;
                        else if(rpt_array[i] == "RX")
                            i += 2;
                        else
                            i++;
                    }
                    
                    if(MPos_flag && WPos_flag){ //this indicates we received both machine and work coordinates (determined by user's grbl $10 setting)
                        this.offsets.x = this.last_machine.x - this.last_work.x; //x offset
                        this.offsets.y = this.last_machine.y - this.last_work.y; //y offset
                        this.offsets.z = this.last_machine.z - this.last_work.z; //z offset
                        $('.com-chilipeppr-grbl-mcswcsoffset').html("X: " + this.offsets.x.toFixed(3) + "&nbsp;&nbsp;&nbsp;Y: " + this.offsets.y.toFixed(3) + "&nbsp;&nbsp;&nbsp;Z: " + this.offsets.z.toFixed(3));
                    }
                    else
                        $('.com-chilipeppr-grbl-mcswcsoffset').html("GRBL must be configured to send both machine and work coordinates to calculate offset.  Please set $10=3 as your report mask variable in GRBL.");

                    if(WPos_flag === true){
                        //send work coordinates where possible.
                        if(this.work_mode===this.report_mode)
                            this.publishAxisStatus({"posx":parseFloat(this.last_work.x),"posy":parseFloat(this.last_work.y),"posz":parseFloat(this.last_work.z)});
                        else if(this.work_mode===1 && this.report_mode===0) //work is inch, reporting in mm
                            this.publishAxisStatus({"posx":this.toInch(parseFloat(this.last_work.x)),"posy":this.toInch(parseFloat(this.last_work.y)),"posz":this.toInch(parseFloat(this.last_work.z))});
                        else if(this.work_mode===0 && this.report_mode===1) //work is mm, reporting in inch
                            this.publishAxisStatus({"posx":this.toMM(parseFloat(this.last_work.x)),"posy":this.toMM(parseFloat(this.last_work.y)),"posz":this.toMM(parseFloat(this.last_work.z))});
                    }
                    else if(MPos_flag == true){
                        //send machine coordinates if available and no work coordinates are being provided
                        if(this.work_mode===this.report_mode)
                            this.publishAxisStatus({"posx":parseFloat(this.last_machine.x),"posy":parseFloat(this.last_machine.y),"posz":parseFloat(this.last_machine.z)});
                        else if(this.work_mode===1 && this.report_mode===0) //work is inch, reporting in mm
                            this.publishAxisStatus({"posx":this.toInch(parseFloat(this.last_machine.x)),"posy":this.toInch(parseFloat(this.last_machine.y)),"posz":this.toInch(parseFloat(this.last_machine.z))});
                        else if(this.work_mode===0 && this.report_mode===1) //work is mm, reporting in inch
                            this.publishAxisStatus({"posx":this.toMM(parseFloat(this.last_machine.x)),"posy":this.toMM(parseFloat(this.last_machine.y)),"posz":this.toMM(parseFloat(this.last_machine.z))});
                    }
                    else{
                        //produce NaN to make user aware no coordinates are being returned by grbl.
                        this.publishAxisStatus({"posx":"x","posy":"y","posz":"z"});
                    }
                }
                else if(msg.indexOf("Grbl") >= 0){
                    //if this is not the first init line, warn the user grbl has been reset
                    if(this.version !== "")
                        chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL has been reset - temporary work coordinate and tool offsets have been lost.");
                    this.version = msg.split(" ")[1];
                    $('#com-chilipeppr-widget-grbl-new .panel-title').text("GRBL (" + this.version + ")"); //update ui  
                }
                else if(msg.search(/^\$[0-9][0-9]*=/g) >= 0){ //is a config report ($0=,$1=...etc)
                    var tmp = msg.split(/ (.+)/); //break out config and description
                    var val = tmp[0].replace("$","").split("="); //split config into variable id and value
                    //console.log(val);
                    this.config[parseInt(val[0],10)] = [parseFloat(val[1]), tmp[1]]; //save config value and description
                    //console.log("GRBL: this.config = ");
                    //console.log(this.config[0]);
                }
                else if(msg.indexOf("ALARM: Probe fail") >= 0){ //0.9g only, changed in 0.9i to return a status bit back
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "Probe Failed - Alarm State!");
                    chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", "alarm");
                    //should we clear the buffer here as well, or resend queued commands afteras a reset to grbl is needed to clear this which will clear all buffered items?
                }
                else if(msg.indexOf("Enabled") >= 0){
                    //action check mode on
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL is now in passive gcode checking mode.");
                }
                else if(msg.indexOf("Disabled") > 0){
                    //action check mode off
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL is now in active run mode.");
                }
            }
        },
        
        sendCode: function (sendline){
            //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush); //unsubscribe before publishing to serial port
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", sendline); //send to serial port 
            console.log("GRBL: Code Sent - " + sendline);
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush, 1); //resubscribe with top priority
        },
        //queryStatus: function(that){
        //    that.sendCode('?\n'); //request status/coordinates
        //},
        lastUnits: "mm", //remove this, and all code associated with the unit change button.
        isShowingStats: true,
        publishAxisStatus: function(sr) {
            // build normalized interface object
            var axes = {
                x: sr.posx !== undefined ? sr.posx : null,
                y: sr.posy !== undefined ? sr.posy : null,
                z: sr.posz !== undefined ? sr.posz : null,
                a: sr.posa !== undefined ? sr.posa : null,
                type: "work"
            };
            // also check if it's the mpox/mpoy/mpoz form (machine coords instead of work coords)
            /*
            if ("mpox" in sr || "mpoy" in sr || "mpoz" in sr || "mpoa" in sr) {
                // we have machine coords
                axes.x = "mpox" in sr ? sr.mpox : null;
                axes.y = "mpoy" in sr ? sr.mpoy : null;
                axes.z = "mpoz" in sr ? sr.mpoz : null;
                axes.a = "mpoa" in sr ? sr.mpoa : null;
                axes.type = "machine";
            }
            */
                    
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/axes", axes);
        },
        plannerLastEvent: "resume",
        publishPlannerPause: function() {
            // tell other widgets to pause their sending because we're too far into
            // filling up the planner buffer
            this.plannerLastEvent = "pause";
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/plannerpause", "");
        },
        publishPlannerResume: function() {
            // tell other widgets they can send again
            this.plannerLastEvent = "resume";
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/plannerresume", "");
        },
        toInch: function(mm){
            return (mm/25.4).toFixed(3);  
        },
        toMM: function(inch){
            return (inch*25.4).toFixed(3);   
        },
        forkSetup: function () {
            var topCssSelector = '#com-chilipeppr-widget-grbl-new';
            
            //$(topCssSelector + ' .fork').prop('href', this.fiddleurl);
            //$(topCssSelector + ' .standalone').prop('href', this.url);
            //$(topCssSelector + ' .fork-name').html(this.id);
            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });
            
            var that = this;
            
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($('#com-chilipeppr-widget-grbl-new .panel-heading .dropdown-menu'), that);
                });
            });
            
        }
    };
});
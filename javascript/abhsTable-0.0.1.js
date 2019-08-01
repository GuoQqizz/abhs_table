; (function ($, window, document, undefined) {
    //默认参数
    var plugName = "abhsTable",
		defaults = {
		    theadData: null, //头部栏目
		    tbodyData: null, //tbody内容
		    tableBordered: true, //是否边框
		    tableStriped: true, //是否隔行变色
		    tableHover: true, //是否划过变色
		    rowHeight: 40,//行高,
		    scrollWidth: 6,//滚动条宽度
		},
        headDefaults = {
            label: "",//列名
            name: null,//绑定列
            width: 0,//每列默认宽度
            algin: "center",//对齐方式
            formatter: null,//自定义模板方法
        };

    //构造类
    function abhsTable($this, options) {
        $this.html("");
        this.doc = $this;//用于存放自己的节点
        this.boxWidth = $this.width();//用于获取控件的宽度
        this.boxHeight = $this.height();//用于获取控件的高度
        this.name = plugName;//用于设定表格名称
        this.headDefaults = headDefaults;//设定表头默认项
        this.options = $.extend({}, defaults, options);//合并默认设定
        this.init();
    }
    //制造表
    function makeTable(_this, options) {
        var headstr = "", columnWidth = 0;
        for (var i in options.theadData) {
            var attr = $.extend({}, headDefaults, options.theadData[i]);
            var style = " style='";
            if (attr.width) {
                style += " width:" + attr.width + "px;";
                columnWidth += attr.width;
            }
            else {
                columnWidth += 40;
            }
            style += "'";
            headstr += "<th" + style + ">" + attr.label + "</th>";
        }
        var str = "<table class='table " + ((_this.options.tableBordered ? " tableBordered" : "") + (_this.options.tableStriped ? " tableStriped" : "") + (_this.options.tableHover ? " tableHover" : "")) + "'" + (columnWidth > _this.boxWidth ? " style='width:" + columnWidth + "px'" : "") + "><thead><tr>";
        str += headstr;
        str += "</tr></thead><tbody>";
        for (var r = 0; r < options.tbodyData.length; r++) {
            str += "<tr>";
            for (var d in options.theadData) {
                var attr = $.extend({}, headDefaults, options.theadData[d]);
                str += "<td>";
                if (typeof (attr.formatter) == "function") {
                    str += attr.formatter(r, options.tbodyData[r][attr.name], options.tbodyData[r]);
                }
                else {
                    str += options.tbodyData[r][attr.name];
                }
                str += "</td>";
            }
            str += "</tr>";
        }
        str += "</tbody></table>";
        return { str: str, sx: columnWidth > _this.boxWidth, cw: columnWidth };
    }

    //获取滚动条长度
    function getScorllWidth(outwidth, inwidth, scrollwidth) {
        return Math.floor(outwidth / inwidth * scrollwidth);
    }
    //计算滚动条
    function MakeScroll(_this) {
        var hasy = _this.bodyBox.offsetHeight < _this.bodyBox.scrollHeight;//判断是否有垂直滚动条
        var hasx = _this.bodyBox.offsetWidth < _this.bodyBox.scrollWidth;//判断是否有水平滚动条
        var yDown = { down: false, top: 0, y: 0 }, xDown = { down: false, left: 0, x: 0 };
        if (hasy) {//如果有横向滚动条
            $(_this.headBox).width(_this.boxWidth - _this.options.scrollWidth);//减少宽度给滚动条留位置
            $(_this.bodyBox).width(_this.boxWidth - _this.options.scrollWidth);//减少宽度给滚动条留位置
            hasx = _this.bodyBox.offsetWidth < _this.bodyBox.scrollWidth;//再次判断是否有水平滚动轴
            var boxheight = (_this.boxHeight - (hasx ? _this.options.scrollWidth : 0)) + "px";//计算表格去除滚动条后的高度
            $(_this.scrollY).height(boxheight).show();//给滚动条设置高度并显示
            $(_this.bodyBox).css("max-height", boxheight);//设置表格的最大高度
            //滚动条计算
            var scroll = $(_this.scrollY).find(".scroll");
            scroll.width(_this.options.scrollWidth).height(getScorllWidth(_this.bodyBox.offsetHeight, _this.bodyBox.scrollHeight, $(_this.scrollY).height() - $(_this.headBox).height() - _this.options.scrollWidth)).css("top", $(_this.headBox).height() + "px");
            scroll.mousedown(function (e) {
                yDown.down = true;
                yDown.y = e.pageY;
                yDown.top = parseInt($(this).css("top"));
                $(_this.doc).addClass("noselect");
            })
        }
        if (hasx) {//如果有水平滚动条
            $(_this.scrollX).width(_this.boxWidth).show();//设置滚动条的宽度并显示
            //滚动条计算
            var scroll = $(_this.scrollX).find(".scroll");
            scroll.height(_this.options.scrollWidth).width(getScorllWidth(_this.bodyBox.offsetWidth, _this.bodyBox.scrollWidth, $(_this.scrollX).width() - _this.options.scrollWidth)).css("left", "0px");
            scroll.mousedown(function (e) {
                xDown.down = true;
                xDown.left = parseInt($(this).css("left"));
                xDown.x = e.pageX;
                $(_this.doc).addClass("noselect");
            })
        }
        $(window).mousemove(function (e) {
            if (xDown.down) {
                var scroll = $(_this.scrollX).find(".scroll");
                var move = e.pageX - xDown.x;
                var left = xDown.left + move;
                var maxl = (_this.boxWidth - scroll.width() - _this.options.scrollWidth);
                if (left < 0) {
                    scroll.css("left", "0px");
                    _this.headBox.scrollLeft = _this.bodyBox.scrollLeft = 0;
                }
                else if (left > maxl) {
                    scroll.css("left", maxl + "px");
                    _this.headBox.scrollLeft = _this.bodyBox.scrollLeft = getScorllWidth(maxl, scroll.width(), _this.bodyBox.offsetWidth);;
                }
                else {
                    scroll.css("left", left + "px");
                    _this.headBox.scrollLeft = _this.bodyBox.scrollLeft = getScorllWidth(left, scroll.width(), _this.bodyBox.offsetWidth);;
                }

            }
            else if (yDown.down) {
                var scroll = $(_this.scrollY).find(".scroll");
                var move = e.pageY - yDown.y;
                var top = yDown.top + move;
                var maxl = _this.boxHeight - scroll.height() - _this.options.scrollWidth;
                if (top < $(_this.headBox).height()) {
                    scroll.css("top", $(_this.headBox).height() + "px");
                    _this.bodyBox.scrollTop = 0;
                }
                else if (top > maxl) {
                    scroll.css("top", maxl + "px");
                    _this.bodyBox.scrollTop = getScorllWidth(maxl - $(_this.headBox).height(), scroll.height(), _this.bodyBox.offsetHeight);
                }
                else {
                    scroll.css("top", top + "px");
                    _this.bodyBox.scrollTop = getScorllWidth(top - $(_this.headBox).height(), scroll.height(), _this.bodyBox.offsetHeight);
                }
            }
        });

        $(window).mouseup(function () {
            xDown.down = yDown.down = false;
            $(_this.doc).removeClass("noselect");
        });
        //滚轮事件
        $(_this.doc).on("mousewheel", function (e) {
            var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||
                          (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
            if (delta == 1) {
                _this.bodyBox.scrollTop -= 10;
            }
            else if (delta == -1) {
                _this.bodyBox.scrollTop += 10;
            }

            var scroll = $(_this.scrollY).find(".scroll");//获取垂直滚动条
            var maxl = _this.boxHeight - scroll.height() - _this.options.scrollWidth;
            var top = _this.bodyBox.scrollTop / _this.bodyBox.offsetHeight * scroll.height() + $(_this.headBox).height();
            scroll.css("top", top + "px");
        });
    }
    abhsTable.prototype = {
        init: function () {
            var table = makeTable(this, this.options);
            this.doc.addClass("abhs_table");
            var html = '<div class="abhs_table_thead" style="width:' + this.boxWidth + 'px; height:' + this.options.rowHeight + 'px;">';
            html += table.str;
            html += "</div>";
            html += '<div class="abhs_table_tbody" style="width:' + this.boxWidth + 'px;' + (this.boxHeight ? "max-height:" + this.boxHeight + "px" : "") + '">';
            html += table.str;
            html += "</div>";
            html += "<div class=\"abhs_table_overflowx\" style=\"height:" + this.options.scrollWidth + "px\"><div class=\"scroll\"></div><div class=\"scroll_xrightbox\" style=\"width:" + this.options.scrollWidth + "px;height:" + this.options.scrollWidth + "px;\"></div></div>";
            html += "<div class=\"abhs_table_overflowy\"style=\"width:" + this.options.scrollWidth + "px\"><div class=\"scroll_ytopbox\"  style=\"width:" + this.options.scrollWidth + "px;\"></div><div class=\"scroll\"></div></div>";
            this.doc.html(html);
            this.headBox = this.doc.find(".abhs_table_thead")[0];
            this.bodyBox = this.doc.find(".abhs_table_tbody")[0];
            this.scrollX = this.doc.find(".abhs_table_overflowx")[0];
            this.scrollY = this.doc.find(".abhs_table_overflowy")[0];
            $(this.headBox).css({ "height": $(this.headBox).find("thead").height() + "px" });
            $(this.scrollY).find(".scroll_ytopbox").css("height", $(this.headBox).height());
            MakeScroll(this);
        },
        headBox: null,
        bodyBox: null,
        scrollX: null,//横向滚动条
        scrollY: null,//纵向滚动条
    }

    $.fn.extend({
        abhsTable: function (options) {
            return this.each(function () {
                new abhsTable($(this), options);
            })
        }
    })
})(jQuery, window, document);
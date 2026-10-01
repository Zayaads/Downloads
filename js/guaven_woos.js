//section init

gws_specials_0 = ["'", '"', '-'];
gws_specials_replacers_0 = ["", "", ""]
ilkherf = '';
prids_object = "";
guaven_woos_cache_keywords_filtered = new Array();
guaven_woos_cache_keywords_filtered_raw = new Array();
guaven_woos_init_scrollstate = jQuery('html').css('overflow');
gws_current_segment='';
gws_current_segment_text='';

gws_specials = [' x ',"'", '"', 'ä', 'ö', 'ü', 'à', 'â', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ù', 'û', 'ÿ', 'å', 'ó', 'ú', 'ů', 'ý', 'ž',
  'á', 'č', 'ď', 'ě', 'í', 'ň', 'ř', 'š', 'ť', 'ñ', 'ç', 'ğ',
  'ı', 'İ', 'ş', 'ã', 'õ', 'ά', 'έ', 'ή', 'ί', 'ϊ', 'ΐ', 'ό', 'ύ', 'ϋ', 'ΰ', 'ώ', 'ə',
  'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я', //russian cyrillic
  'љ', 'њ', 'ѓ', 'ќ', 'џ'
];
gws_specials_replacers = ["x","", "", 'a', 'o', 'u', 'a', 'a', 'e', 'e', 'e', 'e', 'i', 'i', 'o', 'u', 'u', 'y', 'a', 'o', 'u', 'u', 'y', 'z',
  'a', 'c', 'd', 'e', 'i', 'n', 'r', 's', 't', 'n', 'c', 'g',
  'i', 'i', 's', 'a', 'o', 'α', 'ε', 'η', 'ι', 'ι', 'ι', 'ο', 'υ', 'υ', 'υ', 'ω', 'e',
  'a', 'b', 'v', 'g', 'd', 'e', 'io', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'c', 'sh', 'sht', 'a', 'i', 'y', 'e', 'yu', 'ya',
  'lj', 'nj', 'g', 'k', 'dz'
];
$gws_specials   = [
    ' x ',"'", '"', 'ä', 'ö', 'ü', 'à', 'â', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ù', 'û', 'ÿ', 'å', 'ó', 'ú', 'ů', 'ý', 'ž', 'á', 'č', 'ď', 'ě',
    'í', 'ň', 'ř', 'š', 'ť', 'ñ', 'ç', 'ğ', 'ı', 'İ', 'ş', 'ã', 'õ', 'ά', 'έ', 'ή', 'ί', 'ϊ', 'ΐ', 'ό', 'ύ', 'ϋ', 'ΰ', 'ώ', 'ə', 'а', 'б',
    'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы',
    'ь', 'э', 'ю', 'я', 'љ', 'њ', 'ѓ', 'ќ', 'џ', '-', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ',
    'ς', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω','Ã­','σ'
];
$gws_specials_replacers = [
    "x","", "", 'a', 'o', 'u', 'a', 'a', 'e', 'e', 'e', 'e', 'i', 'i', 'o', 'u', 'u', 'y', 'a', 'o', 'u', 'u', 'y', 'z', 'a', 'c', 'd', 'e',
    'i', 'n', 'r', 's', 't', 'n', 'c', 'g', 'i', 'i', 's', 'a', 'o', 'α', 'ε', 'η', 'ι', 'ι', 'ι', 'ο', 'u', 'υ', 'υ', 'ω', 'e', 'a', 'b',
    'v', 'g', 'd', 'e', 'io', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'c', 'sh', 'sht', 'a', 'i',
    'y', 'e', 'yu', 'ya', 'lj', 'nj', 'g', 'k', 'dz', ' ', 'a', 'b', 'g', 'd', 'e', 'z', 'h', 'th', 'i', 'k', 'l', 'm', 'n', 'x', 'o', 'p',
    'r', 's', 't', 'u', 'f', 'ch', 'ps', 'w','i','s'
];

jQuery(window).load(function() {
  jQuery(document).trigger('ready');
});

jQuery(document).ready(function() {
  jQuery('.guaven_woos_mobilesearch').css({
    'height': (jQuery(window).height()) + 'px'
  });

  jQuery(guaven_woos.selector).each(function() {
    if (jQuery(this).is(":focus")) {
      jQuery(this).blur();
    }
  });
  //section init

  gws_queue=0;gws_queued_object="";
  jQuery(document).on('keyup', guaven_woos.selector, function(e) {
    if (typeof guaven_woos_cache_keywords=="undefined") {gws_queue=1;gws_queued_object=jQuery(this);}
  });

  //section load
  jQuery.ajax({
    url: guaven_woos.data_path,
    dataType: "script",
    cache: true
  }).done(function() {
    guaven_woos_runner();
    if (gws_queue==1){jQuery(gws_queued_object).blur();jQuery(gws_queued_object).trigger("focus");}
  });

  jQuery(".gws_clearable").each(function() {
    var gws_inp = jQuery(this).find("input:text"),
        gws_cle = jQuery(this).find(".gws_clearable__clear");
    gws_inp.on("input", function(){
      gws_cle.toggle(!!this.value);
    });
    gws_cle.on("touchstart click", function(e) {
      e.preventDefault();
      gws_inp.val("").trigger("input");
    });
  });
});
//section load


//section small functions
window.guaven_woos_getcookie = function(name) {
  match = document.cookie.match(new RegExp(name + '=([^;]+)'));
  if (match)
    return match[1];
}

function guaven_woos_levenshtein(r, n) {
  if (r == n) return 0;
  var e = r.length,
    t = n.length;
  if (0 === e) return t;
  if (0 === t) return e;
  var a = !1;
  try {
    a = !"0" [0]
  } catch (v) {
    a = !0
  }
  a && (r = r.split(""), n = n.split(""));
  var f = new Array(e + 1),
    i = new Array(e + 1),
    o = 0,
    u = 0,
    l = 0;
  for (o = 0; e + 1 > o; o++) f[o] = o;
  var h = "",
    s = "";
  for (u = 1; t >= u; u++) {
    for (i[0] = u, s = n[u - 1], o = 0; e > o; o++) {
      h = r[o], l = h == s ? 0 : 1;
      var c = f[o + 1] + 1,
        g = i[o] + 1,
        w = f[o] + l;
      c > g && (c = g), c > w && (c = w), i[o + 1] = c
    }
    var y = f;
    f = i, i = y
  }
  return f[e]
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'ig'), replacement);
};

function guaven_woos_replace_array(replaceString, find, replace, quotes) {
  for (var i = 0; i < find.length; i++) {
    if (quotes == 1)
      replaceString = replaceString.replaceAll(find[i], replace[i]);
  }
  return replaceString;
}

function guaven_woos_concatsearch(arrdata, str) {
  //  return -1;
  var hasil = 0;
  var respoint = 0;
  var arrdata_arr = arrdata.split(" ");
  for (i = 0; i < arrdata_arr.length; i++) {
    respoint = respoint + str.indexOf(arrdata_arr[i]);
    if (str.indexOf(arrdata_arr[i]) == -1) hasil = -1;
  }
  if (hasil == -1) respoint = -1;
  return respoint;
}

function guaven_woos_stripQuotes(s) {
  var t = s.length;
  if (s.charAt(0) == '"') s = s.substring(1, t--);
  if (s.charAt(--t) == '"') s = s.substring(0, t);
  return s;
}


function guaven_woos_mobclose() {
  jQuery(guaven_woos.selector).trigger('focusout');
  jQuery('html').css('overflow', guaven_woos_init_scrollstate);
  setTimeout(function() {
    jQuery(".guaven_woos_mobilesearch").hide();
    jQuery("#wpadminbar").show();
  }, 250);
}

function guaven_woos_format(str, ttl) {

  fetch_pid_1 = str.split("prli_");
  if (fetch_pid_1.length>1){
	  for (i=1;i<fetch_pid_1.length;i++){
      fetch_pid_2 = fetch_pid_1[i].split('"');
      if (fetch_pid_2!==null){
        str=str.replace("{gwsvid}",fetch_pid_2[0]);
      }
    }
  }

  str = str.replaceAll('{{t}}', ttl);
  str = str.replaceAll('{{s}}', '</span> <span class=\"guaven_woos_hidden guaven_woos_hidden_tags\">');
  str = str.replaceAll('{{h}}', '<span class=\"guaven_woos_hidden\">');
  str = str.replaceAll('{{l}}', '<li class=\"guaven_woos_suggestion_list\" tabindex=');
  str = str.replaceAll('{{d}}', '\"><div class=\"guaven_woos_div\"><img class=\"guaven_woos_img\" src=\"');
  str = str.replaceAll('{{i}}', '\"></div><div class=\"guaven_woos_titlediv\">');
  str = str.replaceAll('{{e}}', '</div></a> </li>');
  str = str.replaceAll('{{p}}', '</span>');
  str = str.replaceAll('{{m}}', '<small>');
  str = str.replaceAll('{{a}}', '</small>');
  str = str.replaceAll('{{g}}', '</span> <span class=\"gwshd\">');
  str = str.replaceAll('{{v}}', '</span> <span class=\"woos_sku woos_sku_variations\">');
  str = str.replaceAll('{{k}}', '<span class=\"woos_sku\">');
  str = str.replaceAll('{{n}}', '<span class=\"gwstrn\">');
  str = str.replaceAll('{{j}}', '<span class=\"gwshd\">');
  str = str.replaceAll('{{w}}', '</span><span class=\"gwstrn\">');
  str = str.replaceAll('{{c}}', '<span class=\"woocommerce-Price-amount amount\"><span class=\"woocommerce-Price-currencySymbol\">');
  str = str.replaceAll('{{u}}', guaven_woos.updir);
  str = str.replaceAll('"gwp=', '"' + guaven_woos.homeurl + '?p=');
  return str;
}

function guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle, woos_search_existense, guaven_woos_tempval, stortype,woos_key) {
  rescount++;
  gws_foundids.push(woos_key);
  if (guaven_woos.highlight == 1) {
    gwsf_position = guaven_woos_temptitle.toLowerCase().indexOf(guaven_woos_tempval_raw);
    if (gwsf_position > -1) {
      guaven_woos_temptitle = guaven_woos_temptitle.slice(0, gwsf_position) + "<em>" +
        guaven_woos_temptitle.slice(gwsf_position, gwsf_position + guaven_woos_tempval.length) +
        "</em>" + guaven_woos_temptitle.slice(gwsf_position + guaven_woos_tempval.length, guaven_woos_temptitle.length);
    }
  }
  tempformatted = guaven_woos_temphtml+'~g~v~n~'+guaven_woos_temptitle;

  if (stortype == '') {
    if (guaven_woos_dttrr == 1 && typeof(Storage) !== "undefined" && localStorage.keywordsuccess.indexOf(guaven_woos_tempval) == -1) {
      localStorage.keywordsuccess = localStorage.keywordsuccess + guaven_woos_tempval + ', ';
    }
  } else if (guaven_woos_dttrr == 1 && typeof(Storage) !== "undefined" && localStorage.keywordcorrected.indexOf(guaven_woos_tempval) == -1) {
    localStorage.keywordcorrected = localStorage.keywordcorrected + guaven_woos_tempval + ', ';
  }
  return woos_keyformat(woos_search_existense)+woos_keyformat(woos_key) + '~g~v~n~' + tempformatted;
}


function woos_keyformat(numm) {
  numstr = numm;
  if (numm < 10) numstr = '000' + numm;
  else if (numm < 100) numstr = '00' + numm;
  else if (numm < 1000) numstr = '0' + numm;
  return numstr;
}


function guaven_woos_result_catadd() {
  var crescount = 0;
  var guaven_woos_cfinalresult = '';

  ilkherf = guaven_woos_tempval.toLowerCase().substring(0, 1);

  if (guaven_woos.large_data == 1) {
    guaven_woos_findin_data_cat = guaven_woos_cache_cat_keywords_arr[ilkherf];
  } else {
    guaven_woos_findin_data_cat = guaven_woos_category_keywords;
  }

  for (var guaven_woos_ckey in guaven_woos_findin_data_cat) {

    var guaven_woos_ctemptitle = guaven_woos_category_keywords[guaven_woos_ckey];
    if (guaven_woos.translit_data == '') guaven_woos_ctemptitle = guaven_woos_replace_array(guaven_woos_ctemptitle, gws_specials, gws_specials_replacers, 1);
    var guaven_woos_ctemphtml = guaven_woos_category_html[guaven_woos_ckey];

    if (crescount < guaven_woos.cmaxcount &&
      (guaven_woos_ctemptitle.toLowerCase().indexOf(guaven_woos_tempval.toLowerCase()) > -1)) {
      crescount++;
      guaven_woos_cfinalresult = guaven_woos_cfinalresult + guaven_woos_format(guaven_woos_ctemphtml, '');
    }
  }
  return guaven_woos_cfinalresult;
}

function guaven_woos_send_tr_data() {
  guaven_woos_data.failed = localStorage.keywordfailed;
  guaven_woos_data.success = localStorage.keywordsuccess;
  guaven_woos_data.corrected = localStorage.keywordcorrected;
  temporary_sum = guaven_woos_data.failed + guaven_woos_data.success + guaven_woos_data.corrected;
  guaven_woos_data.unid = localStorage.unid;
  if (temporary_sum.length > 0) {
    jQuery.post(guaven_woos_ajaxurl, guaven_woos_data, function(response) {
      localStorage.keywordfailed = '';
      localStorage.keywordsuccess = '';
      localStorage.keywordcorrected = '';
    });
  }
}

function guaven_woos_send_trend(pid, unid) {
  jQuery.post(guaven_woos_ajaxurl, {
    'action': 'guaven_woos_trend',
    'pid': pid,
    'unid': unid
  }, function(response) {});
}

function guaven_woos_uniqid() {
  var ts = String(new Date().getTime()),
    i = 0,
    out = '';
  for (i = 0; i < ts.length; i += 2) {
    out += Number(ts.substr(i, 2)).toString(36);
  }
  return ('d' + out);
}


function guaven_woos_positioner(guaven_woos_input) {
  var guaven_woos_offset = guaven_woos_input.offset();
  guaven_woos_input.attr('autocomplete', 'off');
  jQuery(".guaven_woos_suggestion").css('left', guaven_woos_offset.left);
  jQuery(".guaven_woos_suggestion").css('top', guaven_woos_offset.top + parseFloat(guaven_woos_input.outerHeight()));
  jQuery(".guaven_woos_suggestion").outerWidth(parseFloat(guaven_woos_input.outerWidth()) * guaven_woos.sugbarwidth);
  fixedtempwidh = guaven_woos_input.outerWidth();
  setTimeout(function() {
    if (guaven_woos_input.outerWidth() == fixedtempwidh) {
      jQuery(".guaven_woos_suggestion").css('display', 'block');
    } // if no animation
  }, 100);
  setTimeout(function() {
    jQuery(".guaven_woos_suggestion").css('top', guaven_woos_offset.top + parseFloat(guaven_woos_input.outerHeight()));
    jQuery(".guaven_woos_suggestion").outerWidth(parseFloat(guaven_woos_input.outerWidth()) * guaven_woos.sugbarwidth);
    jQuery(".guaven_woos_suggestion").css('left', guaven_woos_input.offset().left);
    jQuery(".guaven_woos_suggestion").css('display', 'block');
    //for animated search forms
  }, 1000);
}

function guaven_woos_backend_preparer_direct(searchterm) {
  jQuery("body").append('<form method="get" id="gws_hidden_form">' +
    '<input name="post_type" value="product" type="hidden">' +
    '<input name="s" id="s" value="' + searchterm + '"></form>');
	searchterm_formatted=gws_tempval(searchterm);
  jQuery("#gws_hidden_form #s").trigger("focus");
  guaven_woos_display_in = ".guaven_woos_suggestion";
  jQuery("#gws_hidden_form #s").trigger("keyup");
  gws_resubmit=setInterval(function() {
    if (prids_object===null || prids_object==undefined || prids_object.length==0){return;}
	  else {clearInterval(gws_resubmit);}
    guaven_woos_data_2 = {
      'action': 'guaven_woos_pass_to_backend',
      "ids": prids_object,
      "kw": searchterm_formatted
    };

    jQuery.ajax({
      method:'post',
      url: guaven_woos_ajaxurl,
      data: guaven_woos_data_2,
    }).done(function(response) {
        if (response == 'ok'){gws_global_ret=1;jQuery("#gws_hidden_form").submit();}
  });
  }, 300);
}

function guaven_woos_backend_preparer(gws_this,gws_this_tempval){
  gws_this.children("input:submit").attr("disabled", "disabled");
  if (prids_object=='') return 'direct_submit';
  guaven_woos_data_2 = {
    'action': 'guaven_woos_pass_to_backend',
    "ids": prids_object,
    "kw": gws_this_tempval
  };

   jQuery.ajax({
    method:'post',
    url: guaven_woos_ajaxurl,
    data: guaven_woos_data_2,
  }).done(function(response) {
      gws_this.children("input:submit").removeAttr("disabled");
      if (response == 'ok'){gws_global_ret=1;jQuery(gws_this).submit();}
});
}

function gws_tempval(str){
  guaven_woos_tempval = str.trim();
  if (guaven_woos.translit_data == "") guaven_woos_tempval = guaven_woos_replace_array(guaven_woos_tempval.toLowerCase(), gws_specials, gws_specials_replacers, 1);
  else if (guaven_woos.translit_data == 1) guaven_woos_tempval = guaven_woos_replace_array(guaven_woos_tempval.toLowerCase(), $gws_specials, $gws_specials_replacers, 1);
  guaven_woos_tempval=gws_ignore_filter(guaven_woos_tempval);
  return guaven_woos_tempval;
}

function gws_ignore_filter(str){
  if (typeof(guaven_woos_ignorelist)=="undefined") return str;
  if (guaven_woos_ignorelist[0] != '' && guaven_woos_ignorelist[0] != ' ') {
    for (i = 0; i < guaven_woos_ignorelist.length; i++) {
      if (guaven_woos_ignorelist[i].length > 0 && str.length >= (guaven_woos_ignorelist[i].length + 2))
        str = str.replaceAll(guaven_woos_ignorelist[i], "");
    }
  }
  return str;
}

function gws_currency_solver(){
var gws_current_currency = typeof woocs_current_currency !== 'undefined' ? 1 : 0;
if (guaven_woos.woo_multicurrency!=undefined){
		gws_current_currency=2; woocs_current_currency=guaven_woos.woo_multicurrency;
	}
if (gws_current_currency==0) return;
jQuery(".guaven_woos_suggestion .woocommerce-Price-amount").each(function(){
  price_old_cur=jQuery(this).html();
  if (price_old_cur.indexOf(woocs_current_currency.symbol)==-1){
    price_old_cur=price_old_cur.match(/[+-]?([0-9]*[.])?[0-9]+/)[0];
    price_new_cur=0.01*Math.round(100*price_old_cur*woocs_current_currency.rate);
    if (gws_current_currency==2){
    	gws_woo_mc_calculator();
    	price_new_cur=Math.ceil(price_old_cur * woocs_current_currency.rate * (1 + woocs_current_currency.conv / 100)/woocs_current_currency.round)*woocs_current_currency.round-woocs_current_currency.charm;
    }
    if (woocs_current_currency.position=='right'){
      jQuery(this).html(price_new_cur.toFixed(2)+woocs_current_currency.symbol);
    }
    else {
      jQuery(this).html(woocs_current_currency.symbol+price_new_cur.toFixed(2));
    }
  }
});
}

function gws_woo_mc_calculator(){
  if (guaven_woos.woo_multicurrency.charm=='')guaven_woos.woo_multicurrency.charm=0.01;
  if (guaven_woos.woo_multicurrency.conv=='')guaven_woos.woo_multicurrency.conv=0;
  if (guaven_woos.woo_multicurrency.round=='')guaven_woos.woo_multicurrency.round=1;
  if (guaven_woos.woo_multicurrency.rate=='')guaven_woos.woo_multicurrency.rate=1;
}

function gws_simple_expression_response(gws_parceprice,gws_parceprice_final,guaven_woos_temphtml,current_segment,current_segment_text){
    var cont='';
    pureprice=guaven_woos_temphtml.replace(" ","").match('{{p}}(.*){{p}}');
    if (pureprice==null) pureprice=["{{p}}0{{p}}","{{p}}0{{p}}"];
    if (pureprice!='null'){
      pureprice=pureprice[0].split("{{p}}");
      pureprice[pureprice.length-2]=pureprice[pureprice.length-2].replace(",","");
      pureprice_final=parseFloat(pureprice[pureprice.length-2].replace( /^\D+/g, ''));
      if (isNaN(pureprice_final) || pureprice_final==undefined) {
        pureprice[pureprice.length-3]=pureprice[pureprice.length-3].replace(",","");
        pureprice_final=parseFloat(pureprice[pureprice.length-3].replace( /^\D+/g, ''));
      }
      guaven_woos_tempval=guaven_woos_tempval.replace(current_segment_text,"");
      guaven_woos_tempval=guaven_woos_tempval.replace(gws_parceprice[0],"");
      guaven_woos_tempval=guaven_woos_tempval.replace(gws_parceprice[1],"");
      guaven_woos_tempval=guaven_woos_tempval.replace(guaven_woos.currency_abv.toLowerCase(),"");
      if (guaven_woos.currency_singular!='' && guaven_woos.currency_plural!=''){
        guaven_woos_tempval=guaven_woos_tempval.replace(guaven_woos.currency_singular.toLowerCase(),"");
        guaven_woos_tempval=guaven_woos_tempval.replace(guaven_woos.currency_plural.toLowerCase(),"");
      }
      if (current_segment==1 && Math.abs(pureprice_final-gws_parceprice_final)>(pureprice_final*0.2)) cont='continue';
      else if (current_segment==2 && pureprice_final<gws_parceprice_final) {cont='continue';}
      else if (current_segment==0 && pureprice_final>gws_parceprice_final) {cont='continue';}
    }
      return cont;
}
function gws_simple_expression_scanner(guaven_woos_tempval_raw){
  gws_parceprice=false;gws_parceprice_final='';
  guaven_woos_tempval_raw_in=guaven_woos_tempval_raw.replace(guaven_woos.currency_abv.toLowerCase(),guaven_woos.currency_symb);
  guaven_woos_tempval_raw_in=guaven_woos_tempval_raw_in.replace(guaven_woos.currency_abv.toLowerCase()+" ",guaven_woos.currency_symb);
  if (guaven_woos.currency_singular!='' && guaven_woos.currency_plural!=''){
    guaven_woos_tempval_raw_in=guaven_woos_tempval_raw_in.replace(guaven_woos.currency_singular.toLowerCase(),guaven_woos.currency_symb);
    guaven_woos_tempval_raw_in=guaven_woos_tempval_raw_in.replace(guaven_woos.currency_plural.toLowerCase(),guaven_woos.currency_symb);
  }
  gws_match=new Array();
  gws_match[0]=new RegExp("["+guaven_woos.currency_symb+"]([0-9]+[\.]*[0-9]*)");
  gws_match[1]=new RegExp("([0-9]+[\.]*[0-9]*)["+guaven_woos.currency_symb+"]");
  gws_match[2]=new RegExp("([0-9]+[\.]*[0-9]*)[ ]["+guaven_woos.currency_symb+"]");

  for (k=0;k<gws_match.length;k++){
    gws_parceprice=guaven_woos_tempval_raw_in.match(gws_match[k]);
    if (gws_parceprice && guaven_woos_tempval_raw_in.indexOf(guaven_woos.currency_symb.toLowerCase())>-1){
      gws_parceprice_final=gws_parceprice[0].replace(/\D/g,'');
      break;
    }
  }
  gws_current_segment=1;gws_current_segment_text='';
  for(j=0;j<guaven_woos.expression_segments.length;j++){
    if (guaven_woos_tempval_raw_in.indexOf(guaven_woos.expression_segments[j])>-1){

      gws_current_segment=j;gws_current_segment_text=guaven_woos.expression_segments[j];
    }
  }
  return gws_parceprice;
}
//section small functions


//section larger functions
function guaven_woos_finish_rendering(){
  guaven_woos_cfinalresult = '';
  if (guaven_woos.categories_enabled == 1) {
    guaven_woos_cfinalresult = guaven_woos_result_catadd();
    if (guaven_woos_cfinalresult != '')
      guaven_woos_cfinalresult = "<ul class='guaven_woos_suggestion_catul'>" + guaven_woos_cfinalresult + "</ul>";
  }

  if (guaven_woos.backend == 3 && prids_object=='') {
    prids_object='0,0';
  }

  guaven_show_all = '';
  if (guaven_woos.show_all_text != '') {
    guaven_show_all = '<li class="guaven_woos_showallli"><a onclick="gws_current_input_object.closest(\'form\').submit()" href="javascript://">' +
      guaven_woos.show_all_text + '</a></li>';
  }

  if (typeof guaven_woos_display_in == "undefined") {
    guaven_woos_display_in=gws_define_suggestion_area(gws_current_input_object);
  }

  jQuery('.guaven_woos_suggestion').html(guaven_woos_cfinalresult + "<ul class=\"guaven_woos_final_results\">" + guaven_woos_finalresult + guaven_show_all + "</ul>");
  gws_currency_solver();
  if (guaven_woos_display_in != '.guaven_woos_suggestion_standalone') {
    if (rescount > 0) jQuery(".guaven_woos_suggestion").css('display', 'block');
    else if (guaven_woos.shownotfound == '' && guaven_woos_cfinalresult == '')
      jQuery(".guaven_woos_suggestion").css('display', 'none');
  }
  if (guaven_woos.shownotfound != '' && guaven_woos_finalresult == '' && guaven_woos_cfinalresult == '') {
    jQuery('.guaven_woos_suggestion').html("<ul  class=\"guaven_woos_final_results\"><li>" + guaven_woos.shownotfound + "</li></ul>");
    if (guaven_show_all != '') jQuery(".guaven_woos_showallli").remove();
    if (guaven_woos_dttrr == 1 && typeof(Storage) !== "undefined") {
      localStorage.keywordfailed = localStorage.keywordfailed + guaven_woos_tempval + ', ';
    }
    if (guaven_woos.populars_enabled == 1 && guaven_woos_populars_html) {
      guaven_woos_populars_final = '';
      for (var guaven_woos_pps in guaven_woos_populars_html) {
        guaven_woos_populars_final += guaven_woos_format(guaven_woos_populars_html[guaven_woos_pps], guaven_woos_populars_keywords[guaven_woos_pps]);
      }
      jQuery('.guaven_woos_suggestion').append("<ul class='guaven_woos_suggestion_unlisted guaven_woos_suggestion_populars'>" +
        guaven_woos_populars_final + "</ul>");
    }
  }
}

function guaven_woos_result_loop(tries) {
  var keyhelper = new Array();
  var keyhelper_relevant = new Array();

  guaven_woos_tempval = guaven_woos_tempval.replaceAll(".00''", "''");
  guaven_woos_tempval = guaven_woos_tempval.toLowerCase();
  ilkherf = guaven_woos_tempval.substring(0, 1);

  if (guaven_woos_tempval.indexOf('guaven') > -1) return;
  if (guaven_woos.large_data == 1) {
    guaven_woos_findin_data = guaven_woos_cache_keywords_arr[ilkherf];
  } else {
    guaven_woos_findin_data = guaven_woos_cache_keywords;
  }
  gws_parceprice=false;
if (guaven_woos.simple_expressions==1){
  gws_parceprice=gws_simple_expression_scanner(guaven_woos_tempval_raw);
}
guaven_woos_tempval_space=guaven_woos_tempval.indexOf(" ");

  var guaven_woos_temptitle = '';
  var guaven_woos_temptitle_raw = '';
  var guaven_woos_temphtml = '';
  //MAIN LOOP STARTS
  for (var guaven_woos_key in guaven_woos_findin_data) {
    guaven_woos_temphtml = guaven_woos_cache_html[guaven_woos_key];
    if (guaven_woos_cache_keywords_filtered[guaven_woos_key] != undefined) {
      guaven_woos_temptitle = guaven_woos_cache_keywords_filtered[guaven_woos_key];
      guaven_woos_temptitle_raw = guaven_woos_cache_keywords_filtered_raw[guaven_woos_key];
    } else {
      guaven_woos_temptitle = guaven_woos_cache_keywords[guaven_woos_key];
      guaven_woos_temptitle_raw = guaven_woos_temptitle;
      guaven_woos_temptitle = guaven_woos_temptitle.toLowerCase();
      if (guaven_woos.translit_data == '') guaven_woos_temptitle = guaven_woos_replace_array(guaven_woos_temptitle, gws_specials, gws_specials_replacers, 1);
      guaven_woos_cache_keywords_filtered[guaven_woos_key] = guaven_woos_temptitle;
      guaven_woos_cache_keywords_filtered_raw[guaven_woos_key] = guaven_woos_temptitle_raw;
    }

    if (guaven_woos.live_filter_selector != '') {
      guaven_woos_curcatid = jQuery(guaven_woos.live_filter_selector).val();
      if (guaven_woos_temptitle_raw.indexOf(guaven_woos_curcatid) == -1) {
        continue;
      }
    }

    if (gws_parceprice && gws_parceprice_final!='') {
      simple_expression_response=gws_simple_expression_response(gws_parceprice,gws_parceprice_final,guaven_woos_temphtml,gws_current_segment,gws_current_segment_text);
      if (simple_expression_response=='continue') continue;
    }

    if (guaven_woos.exactmatch == 1) {
      guaven_woos_temptitle_exact_string = guaven_woos_temptitle.replace(/(<([^>]+)>)/ig, ""); // Returns: bar
      guaven_woos_temptitle_exact_string = guaven_woos_temptitle_exact_string.replaceAll(",", " ");
      guaven_woos_temptitle_exact_string = guaven_woos_stripQuotes(guaven_woos_temptitle_exact_string);
      guaven_woos_temptitle_exact = guaven_woos_temptitle_exact_string.split(" ");
      for (var exact_key in guaven_woos_temptitle_exact) {
        if (guaven_woos_temptitle_exact[exact_key] == guaven_woos_tempval) {
          keyhelper.push(guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle_raw, exact_key, guaven_woos_tempval, '',guaven_woos_key));
        }
      }

    } else if (tries == 0) {

      if (guaven_woos.orderrelevancy==1){
        var woos_search_existense_relevant = guaven_woos_temptitle.indexOf(guaven_woos_tempval + " ");
      }
      else {
        var woos_search_existense_relevant=-1;
      }


      if (woos_search_existense_relevant ===0) {
        keyhelper_relevant.push(guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle_raw, woos_search_existense_relevant, guaven_woos_tempval, '',guaven_woos_key));
      } else {
        var woos_search_existense = guaven_woos_temptitle.indexOf(guaven_woos_tempval);
        if (woos_search_existense > -1) {
          keyhelper.push(guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle_raw, woos_search_existense, guaven_woos_tempval, '',guaven_woos_key));
        } else if (guaven_woos_tempval_space > -1) {
          var concatsearch = guaven_woos_concatsearch(guaven_woos_tempval, guaven_woos_temptitle);
          if (concatsearch > -1) {
            keyhelper.push(guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle_raw, concatsearch + guaven_woos.maxcount, guaven_woos_tempval, '',guaven_woos_key));
          }
        }
      }

      if (guaven_woos.disable_meta_correction == 1 && woos_search_existense_sku == -1) {
        woos_search_existense_sku = guaven_woos_temptitle_raw.toLowerCase().indexOf(" " + guaven_woos_tempval_raw + " ");
        if (woos_search_existense_sku == -1 || woos_search_existense_sku <= guaven_woos_temptitle_raw.indexOf("woos_sku")) {
          woos_search_existense_sku = -1;
        }
      }

    } else if (guaven_woos.correction_enabled == 1) {
      if (woos_search_existense_sku > -1) break; //special section - need to be improved for general use

      if (guaven_woos.disable_meta_correction==1){
       guaven_woos_temptitle_temp=guaven_woos_temptitle_raw.split("woos_sku");
       guaven_woos_temptitle=guaven_woos_temptitle_temp[0];
     }

     if (guaven_woos.disable_meta_correction==1){
       if (guaven_woos_temptitle_raw.indexOf("woos_sku")>-1){
        guaven_woos_temptitle_temp=guaven_woos_temptitle_raw.split("woos_sku");
       }
       else{
        guaven_woos_temptitle_temp=guaven_woos_temptitle_raw.split("{{k}}");
       }        
       guaven_woos_temptitle=guaven_woos_temptitle_temp[0];
     }


      if (jQuery.inArray(guaven_woos_key,gws_foundids)>-1) continue;
      var lev_a = guaven_woos_tempval;
      guaven_woos_temptitle_startpoint = guaven_woos_temptitle.indexOf(lev_a.substring(0, 1));
      if (guaven_woos_temptitle_startpoint == -1) guaven_woos_temptitle_startpoint = 0;
      var lev_b = guaven_woos_temptitle.substr(guaven_woos_temptitle_startpoint, lev_a.length);

      var corrected_push = 0;

      finalpercent = guaven_woos_levenshtein(lev_a, lev_b);

      if (finalpercent <= 3 && finalpercent >= 1 && finalpercent < (lev_a.length - 3)) {
        corrected_push = 1;
      } else {
        var lev_a = guaven_woos_tempval.replace(" ", "");
        gwtsp_splitted = guaven_woos_temptitle.split(' ');

        for (var gwtsp in gwtsp_splitted) {
          if (gwtsp_splitted[gwtsp].length < 3) continue;
          finalpercent = guaven_woos_levenshtein(lev_a, gwtsp_splitted[gwtsp]);
          if (finalpercent >= 1 && finalpercent <= 3 && finalpercent < (gwtsp_splitted[gwtsp].length - 3)) {
            corrected_push = 1;
          }
        }
      }
      if (corrected_push == 1) {
        keyhelper.push(guaven_woos_result_push(guaven_woos_temphtml, guaven_woos_temptitle_raw, (100 + guaven_woos.maxcount + guaven_woos_temptitle.indexOf(guaven_woos.wpml)), guaven_woos_tempval, 'corrected',guaven_woos_key));
      }
    }
  }

  if (guaven_woos.orderrelevancy==1){
    keyhelper_relevant.sort();
    keyhelper.sort();
    keyhelper = keyhelper_relevant.concat(keyhelper);
  }

  var rescount_new = 0;
  for (var keyh in keyhelper) {
    purevalue_str=keyhelper[keyh]+'';
    purevalue = purevalue_str.split("~g~v~n~");
    if (purevalue[1]==undefined) continue;
    if (guaven_woos_finalresult.indexOf(purevalue[1]) == -1) {
      if (guaven_woos.backend == 3) {
        purevalue_1 = purevalue[1].split("prli_");
        purevalue_2 = purevalue_1[1].split('"');
        prids_object = prids_object + purevalue_2[0] + ",";
      }
      if (rescount_new < guaven_woos.maxcount) {
        rescount_new++;
        guaven_woos_finalresult = guaven_woos_finalresult + guaven_woos_format(purevalue[1], purevalue[2]);
      }
    }
  }
}

function gws_get_unid() {
  if (typeof(Storage) !== "undefined") return localStorage.unid;
  else return guaven_woos_getcookie('gws_unid');
}

function gws_define_suggestion_area (gwsjqthis){
  if (gwsjqthis.attr("id") != 'guaven_woos_standalone_s') {
    return '.guaven_woos_suggestion';
  } else {
    return '.guaven_woos_suggestion_standalone';
  }
}

//section main procedure
guaven_woos_input = '';

function guaven_woos_runner() {
  var guaven_woos_object_name = guaven_woos.selector;
  var guaven_woos_object = jQuery(guaven_woos_object_name);
  var newunid = '';
  if (typeof(Storage) !== "undefined") {
    if (guaven_woos_dttrr == 1) {
      if ((localStorage.keywordsuccess == undefined)) localStorage.setItem("keywordsuccess", "");
      if ((localStorage.keywordfailed == undefined)) localStorage.setItem("keywordfailed", "");
      if ((localStorage.keywordcorrected == undefined)) localStorage.setItem("keywordcorrected", "");
    }
    if ((localStorage.unid == undefined)) {
      newunid = "user_" + guaven_woos_uniqid();
      localStorage.setItem("unid", newunid);
      document.cookie = "gws_unid=" + newunid + ";path=/";
    } else if (guaven_woos_getcookie('gws_unid') == undefined) document.cookie = "gws_unid=" + localStorage.unid + ";path=/";
  } else if (guaven_woos_getcookie('gws_unid') == undefined) document.cookie = "gws_unid=" + "user_" + guaven_woos_uniqid() + ";path=/";


  guaven_woos_cache_keywords_arr = new Array();
  guaven_woos_cache_cat_keywords_arr = new Array();

  if (guaven_woos.large_data == 1) {
    for (var guaven_woos_key in guaven_woos_cache_keywords) {
      var indexA = guaven_woos_cache_keywords[guaven_woos_key].substring(0, 1).toLowerCase();
      if (!guaven_woos_cache_keywords_arr.hasOwnProperty(indexA)) {
        guaven_woos_cache_keywords_arr[indexA] = new Array();
      }
      guaven_woos_cache_keywords_arr[indexA][guaven_woos_key] = guaven_woos_cache_keywords[guaven_woos_key];
    }
    for (var guaven_woos_key in guaven_woos_category_keywords) {
      var indexA = guaven_woos_category_keywords[guaven_woos_key].substring(0, 1).toLowerCase();
      if (!guaven_woos_cache_cat_keywords_arr.hasOwnProperty(indexA)) {
        guaven_woos_cache_cat_keywords_arr[indexA] = new Array();
      }
      guaven_woos_cache_cat_keywords_arr[indexA][guaven_woos_key] = guaven_woos_category_keywords[guaven_woos_key];
    }
  }

  guaven_woos_cache_keywords_str = JSON.stringify(guaven_woos_cache_keywords);

  jQuery(document).on('focus', guaven_woos_object_name, function() {
    if (guaven_woos.mobilesearch == 1 && jQuery('.guaven_woos_mobilesearch').width() < '768') {
      jQuery('.guaven_woos_mobilesearch').show();
      jQuery("body").addClass("guaven_woos_mobile_div_state");
      jQuery('.guaven_woos_suggestion').css({
        'overflow-y': 'scroll',
        'max-height': jQuery(".guaven_woos_mobilesearch").height() - 120 + 'px'
      });
      jQuery("#wpadminbar").hide();
      jQuery('html').css('overflow', 'hidden');
      if (jQuery(this).attr("id") != 'guaven_woos_s') {
        jQuery(this).blur();
        setTimeout(function() {
          jQuery("#guaven_woos_s").trigger('focus');
        }, 400);
        return;
      }
    }

    guaven_woos_input = jQuery(this);
    guaven_woos_display_in=gws_define_suggestion_area(guaven_woos_input);
    if(guaven_woos_display_in=='.guaven_woos_suggestion'){
      guaven_woos_positioner(guaven_woos_input);
    }

    if (jQuery(this).val() != '') {
      jQuery(this).trigger("keyup");
    } else if (guaven_woos.focused == 0) {
      jQuery(guaven_woos_display_in).html("");
      if (guaven_woos.showinit.length > 2) jQuery(guaven_woos_display_in).html("<ul class=\"guaven_woos_init_text\"><li tabindex=\"-1\">" + guaven_woos.showinit + "</li></ul>");
      if (guaven_woos.pinnedtitle && (guaven_woos_pinned_cat_html != '' || guaven_woos_pinned_html)) {

        guaven_woos_pinned_final = '';
        for (var guaven_woos_ph in guaven_woos_pinned_html) {
          if (guaven_woos_pinned_keywords[guaven_woos_ph].indexOf(guaven_woos.wpml) > -1)
            guaven_woos_pinned_final += guaven_woos_format(guaven_woos_pinned_html[guaven_woos_ph], guaven_woos_pinned_keywords[guaven_woos_ph]);
        }
        guaven_woos_pinned_final = guaven_woos_pinned_cat_html + guaven_woos_pinned_final;
        jQuery(guaven_woos_display_in).append("<p class=\"guaven_woos_pinnedtitle guaven_woos_feattitle\">" + guaven_woos.pinnedtitle + "</p><ul class='guaven_woos_suggestion_unlisted'>" +
          guaven_woos_pinned_final + "</ul>");
      }

      if (guaven_woos.trending != undefined && guaven_woos.trending[0].length > 2) {
        gws_trend_html = JSON.parse(guaven_woos.trending[0]);
        gws_trend_keywords = JSON.parse(guaven_woos.trending[1]);
        guaven_woos_trend_final = '';
        for (var guaven_woos_pps in gws_trend_html) {
          if (gws_trend_keywords[guaven_woos_pps].indexOf(guaven_woos.wpml) == -1) continue;
          guaven_woos_trend_final = guaven_woos_trend_final + guaven_woos_format(gws_trend_html[guaven_woos_pps], gws_trend_keywords[guaven_woos_pps]).replace(/\\/g, '');
        }
        jQuery(guaven_woos_display_in).append("<p class=\"guaven_woos_pinnedtitle guaven_woos_trendtitle\">" + guaven_woos.trendtitle + "</p><ul class='guaven_woos_suggestion_unlisted guaven_woos_suggestion_trend'>" +
          guaven_woos_trend_final + "</ul>");
      }

      if (guaven_woos.persprod != '' && guaven_woos.persprod != undefined) {
          jQuery(guaven_woos_display_in).append("<p class=\"guaven_woos_pinnedtitle guaven_woos_perstitle\">" + guaven_woos.perst +
          "</p><ul class='guaven_woos_suggestion_unlisted'>" + guaven_woos_format(guaven_woos.persprod) + "</ul>");
      }
      gws_currency_solver();
    }
    guaven_woos.focused = 1;
  });
  jQuery(document).on('focusout', guaven_woos_object_name, function() {
    guaven_woos.focused = 0;
    setTimeout(function() {
      if (jQuery(".guaven_woos_mobilesearch").css("display")!='block') {
        jQuery(".guaven_woos_suggestion").css('display', 'none');
      }
    }, guaven_woos.delay_time);
  });

  runSearch = '';is_runSearch=0;runSearch_live = '';is_runSearch_live=0;
  gws_global_ret=0;
  guaven_woos_lastval = '';
  woos_search_existense_sku = -1;
  gws_current_input_object = '';
  gws_foundids=[];
  jQuery(document).on('keyup', guaven_woos_object_name, function(e) {
    gws_current_input_object = jQuery(this);
    if (guaven_woos_lastval == jQuery(this).val()) return;
    else guaven_woos_lastval = jQuery(this).val();
    woos_search_existense_sku = -1;
    prids_object = "";
    if (e.which === 40 || e.which === 38)
      return;
    guaven_woos_finalresult = '';
    rescount = 0;

    guaven_woos_tempval=gws_tempval(jQuery(this).val());
    guaven_woos_tempval_raw = jQuery(this).val().toLowerCase();
    is_runSearch=1;
    is_runSearch_live=1;
    gws_foundids=[];
    clearTimeout(runSearch);
    clearTimeout(runSearch_live);
    runSearch_live=setTimeout(function() {
      if (guaven_woos.live_server!=1) return;
      if (guaven_woos_tempval.length >= (guaven_woos.minkeycount - 1)) {
        is_runSearch_live=0;
        guaven_woos_do_newer_search(guaven_woos_tempval);
      }
      else if (guaven_woos.showinit.length > 2) {
        jQuery('.guaven_woos_suggestion').html("<ul  class=\"guaven_woos_init_text\"><li>" + guaven_woos.showinit + "</li></ul>");
      } else if (guaven_woos.showinit.length == 0) {
        jQuery('.guaven_woos_suggestion').html("");
      }
      if (e.which != undefined && guaven_woos_dttrr == 1) {
        setTimeout('guaven_woos_send_tr_data()', 3000);
      }
    },guaven_woos.engine_start_delay);

    runSearch = setTimeout(function() {
      if (guaven_woos.live_server==1) return;
      if (guaven_woos_tempval.length >= (guaven_woos.minkeycount - 1)) {
        guaven_woos_result_loop(0);
        if (rescount <= guaven_woos.maxtypocount && rescount <= guaven_woos.maxcount) {
          maxpercent = 0;
          finalpercent = 0;
          maxsimilarword = '';
          guaven_woos_result_loop(1);
        }
      is_runSearch=0;
      guaven_woos_finish_rendering();
      } else if (guaven_woos.showinit.length > 2) {
        jQuery('.guaven_woos_suggestion').html("<ul  class=\"guaven_woos_init_text\"><li>" + guaven_woos.showinit + "</li></ul>");
      } else if (guaven_woos.showinit.length == 0) {
        jQuery('.guaven_woos_suggestion').html("");
      }
      if (e.which != undefined && guaven_woos_dttrr == 1) {
        setTimeout('guaven_woos_send_tr_data()', 3000);
      }
    }, guaven_woos.engine_start_delay);
  });



  var li = jQuery('.guaven_woos_suggestion li');
  var liSelected=-1;
  jQuery(window).keydown(function(e) {
    li = jQuery('.guaven_woos_suggestion li');
    if (e.which === 40) {
      if (liSelected!=-1) {
        li.eq(liSelected).removeClass('guaven_woos_selected');
        next = liSelected+1;
        if (next <= li.length-1) {
          liSelected = liSelected+1;
        } else {
          liSelected =0;
        }
        li.eq(liSelected).addClass('guaven_woos_selected');
      } else {
        liSelected=0;
        li.eq(liSelected).addClass('guaven_woos_selected');
      }
    } else if (e.which === 38) {
      if (liSelected!=-1) {
        li.eq(liSelected).removeClass('guaven_woos_selected');
        prev = liSelected-1;
        if (prev >= 0) {
          liSelected = liSelected-1;
        } else {
          liSelected =li.length-1;
        }
        li.eq(liSelected).addClass('guaven_woos_selected');
      } else {
        liSelected=0;
        li.eq(liSelected).addClass('guaven_woos_selected');
      }
    }
    else if(e.which == 13 && jQuery(".guaven_woos_selected").html()!=undefined && jQuery(".guaven_woos_selected>a").html()!=undefined) {
      if (jQuery(".guaven_woos_selected>a").attr("href")!=undefined && jQuery(".guaven_woos_selected>a").attr("href").indexOf("http")>-1){
        e.preventDefault();
        window.location.href=jQuery(".guaven_woos_selected>a").attr("href");
        return false;
      }
    }
  });

  jQuery("form").each(function() {
    if (guaven_woos.backend == 2 && jQuery(this).has(guaven_woos.selector).length > 0) {
      jQuery(this).attr("action", guaven_woos.search_results);
      jQuery(this).append('<input type="hidden" name="guaven_woos_stdnln" value="1">');
    }
  });

  jQuery(guaven_woos.selector).closest('form').submit(function() {
    if (gws_global_ret==1 || guaven_woos.backend!=3) return true;
    gws_this=jQuery(this);
    gws_this_tempval=gws_tempval(gws_this.find('[name="s"]').val());
    if (gws_this_tempval=='') return true;
    if (is_runSearch==1) {
      setTimeout(function(){
      guaven_woos_backend_preparer(gws_this,gws_this_tempval); jQuery(gws_this).submit();
    },1000);
  }
  else {
    check_direct_submit=guaven_woos_backend_preparer(gws_this,gws_this_tempval);
		if(check_direct_submit=='direct_submit') return true;
  }
  return false;
  });

  jQuery(".guaven_woos_showallli a").on("click", function(e) {
    e.preventDefault();
    jQuery(guaven_woos.selector).closest('form').submit();
  });
}
//section main procedure
//section larger functions

gws_results='';gws_xhr='';gws_firstconnect=0;
function guaven_woos_do_newer_search (keyword){
  if (typeof(gws_xhr)!='string'){
    gws_xhr.abort();
  }
  gws_results='';
  gws_results_done='';
  var data={
       action:'guaven_woos_new_request',
       gws_search: keyword,
       gws_lang:guaven_woos.wpml,
       validate_code: guaven_woos.validate_code,
       gws_connected: gws_firstconnect
       //add nonce
  };
  gws_xhr=jQuery.post(guaven_woos.live_server_path, data, function(response){
       response_split=response.split("~gws_plus_found_ids~");
       guaven_woos_finalresult= guaven_woos_format(response_split[0]);
       prids_object=response_split[1];
       gws_firstconnect=1;
       guaven_woos_finish_rendering();
  });
}

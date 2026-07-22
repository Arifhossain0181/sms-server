"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/utils/logger.ts
var isProd, noop, withPrefix, logger, logger_default;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    isProd = process.env.NODE_ENV === "production";
    noop = () => {
    };
    withPrefix = (prefix, fn) => (...args) => fn(prefix, ...args);
    logger = {
      // Debug/info are noisy request-level logs — disabled in production to avoid
      // the synchronous I/O cost of console.log on every request.
      debug: isProd ? noop : withPrefix("[DEBUG]", console.log.bind(console)),
      info: isProd ? noop : withPrefix("[INFO]", console.log.bind(console)),
      warn: withPrefix("[WARN]", console.warn.bind(console)),
      error: withPrefix("[ERROR]", console.error.bind(console))
    };
    logger_default = logger;
  }
});

// src/config/socket.ts
var import_socket, io, initSocket, getIO, emitToUser, emitToRole;
var init_socket = __esm({
  "src/config/socket.ts"() {
    "use strict";
    import_socket = require("socket.io");
    init_logger();
    initSocket = (server2) => {
      io = new import_socket.Server(server2, {
        cors: {
          origin: process.env.CLIENT_URL,
          methods: ["GET", "POST"],
          credentials: true
        }
      });
      io.on("connection", (socket) => {
        logger_default.debug("Client connected:", socket.id);
        socket.on("join", (payload) => {
          if (typeof payload === "string") {
            socket.join(payload);
            return;
          }
          if (payload?.userId) socket.join(payload.userId);
          if (payload?.role) socket.join(payload.role);
        });
        socket.on("disconnect", () => {
          logger_default.debug("Client disconnected:", socket.id);
        });
      });
    };
    getIO = () => {
      if (!io) throw new Error("Socket not initialized");
      return io;
    };
    emitToUser = (userId, event, payload) => {
      getIO().to(userId).emit(event, payload);
    };
    emitToRole = (role, event, payload) => {
      getIO().to(role).emit(event, payload);
    };
  }
});

// src/config/db.ts
var import_config, import_client, import_adapter_pg, import_pg, isProd2, pool, prisma, db_default;
var init_db = __esm({
  "src/config/db.ts"() {
    "use strict";
    import_config = require("dotenv/config");
    import_client = require("@prisma/client");
    import_adapter_pg = require("@prisma/adapter-pg");
    import_pg = require("pg");
    isProd2 = process.env.NODE_ENV === "production";
    pool = new import_pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX) || 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4,
      maxUses: 1e4,
      allowExitOnIdle: true
    });
    prisma = new import_client.PrismaClient({
      adapter: new import_adapter_pg.PrismaPg(pool),
      // `query` logging is very verbose (every query) — only in development.
      log: isProd2 ? ["error"] : ["query", "error"]
    });
    db_default = prisma;
  }
});

// src/utils/pagination.util.ts
var paginate;
var init_pagination_util = __esm({
  "src/utils/pagination.util.ts"() {
    "use strict";
    paginate = async (model, where, page, limit) => {
      const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
      const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;
      const skip = (safePage - 1) * safeLimit;
      const take = safeLimit;
      const total = await model.count({ where });
      return {
        skip,
        take,
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit)
        }
      };
    };
  }
});

// ../../../../node_modules/media-typer/index.js
var require_media_typer = __commonJS({
  "../../../../node_modules/media-typer/index.js"(exports2) {
    "use strict";
    var paramRegExp = /; *([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *= *("(?:[ !\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u0020-\u007e])*"|[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) */g;
    var textRegExp = /^[\u0020-\u007e\u0080-\u00ff]+$/;
    var tokenRegExp = /^[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+$/;
    var qescRegExp = /\\([\u0000-\u007f])/g;
    var quoteRegExp = /([\\"])/g;
    var subtypeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/;
    var typeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/;
    var typeRegExp = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
    exports2.format = format;
    exports2.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var subtype = obj.subtype;
      var suffix = obj.suffix;
      var type = obj.type;
      if (!type || !typeNameRegExp.test(type)) {
        throw new TypeError("invalid type");
      }
      if (!subtype || !subtypeNameRegExp.test(subtype)) {
        throw new TypeError("invalid subtype");
      }
      var string = type + "/" + subtype;
      if (suffix) {
        if (!typeNameRegExp.test(suffix)) {
          throw new TypeError("invalid suffix");
        }
        string += "+" + suffix;
      }
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!tokenRegExp.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      if (typeof string === "object") {
        string = getcontenttype(string);
      }
      if (typeof string !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = string.indexOf(";");
      var type = index !== -1 ? string.substr(0, index) : string;
      var key;
      var match;
      var obj = splitType(type);
      var params = {};
      var value;
      paramRegExp.lastIndex = index;
      while (match = paramRegExp.exec(string)) {
        if (match.index !== index) {
          throw new TypeError("invalid parameter format");
        }
        index += match[0].length;
        key = match[1].toLowerCase();
        value = match[2];
        if (value[0] === '"') {
          value = value.substr(1, value.length - 2).replace(qescRegExp, "$1");
        }
        params[key] = value;
      }
      if (index !== -1 && index !== string.length) {
        throw new TypeError("invalid parameter format");
      }
      obj.parameters = params;
      return obj;
    }
    function getcontenttype(obj) {
      if (typeof obj.getHeader === "function") {
        return obj.getHeader("content-type");
      }
      if (typeof obj.headers === "object") {
        return obj.headers && obj.headers["content-type"];
      }
    }
    function qstring(val) {
      var str = String(val);
      if (tokenRegExp.test(str)) {
        return str;
      }
      if (str.length > 0 && !textRegExp.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(quoteRegExp, "\\$1") + '"';
    }
    function splitType(string) {
      var match = typeRegExp.exec(string.toLowerCase());
      if (!match) {
        throw new TypeError("invalid media type");
      }
      var type = match[1];
      var subtype = match[2];
      var suffix;
      var index = subtype.lastIndexOf("+");
      if (index !== -1) {
        suffix = subtype.substr(index + 1);
        subtype = subtype.substr(0, index);
      }
      var obj = {
        type,
        subtype,
        suffix
      };
      return obj;
    }
  }
});

// ../../../../node_modules/mime-db/db.json
var require_db = __commonJS({
  "../../../../node_modules/mime-db/db.json"(exports2, module2) {
    module2.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: ["es", "ecma"]
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["asc", "sig"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "iana"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "iana"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana"
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "iana"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "iana"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geo+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana"
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hl7cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "iana"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "iana"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.youtube.yt": {
        source: "iana"
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana"
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "iana"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "apache",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/news": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "iana"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "iana"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana"
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "iana"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        compressible: true
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["markdown", "md"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "iana"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// ../../../../node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "../../../../node_modules/mime-db/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_db();
  }
});

// ../../../../node_modules/mime-types/index.js
var require_mime_types = __commonJS({
  "../../../../node_modules/mime-types/index.js"(exports2) {
    "use strict";
    var db = require_mime_db();
    var extname = require("path").extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports2.charset = charset;
    exports2.charsets = { lookup: charset };
    exports2.contentType = contentType;
    exports2.extension = extension;
    exports2.extensions = /* @__PURE__ */ Object.create(null);
    exports2.lookup = lookup;
    exports2.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports2.extensions, exports2.types);
    function charset(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var mime = match && db[match[1].toLowerCase()];
      if (mime && mime.charset) {
        return mime.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime = str.indexOf("/") === -1 ? exports2.lookup(str) : str;
      if (!mime) {
        return false;
      }
      if (mime.indexOf("charset") === -1) {
        var charset2 = exports2.charset(mime);
        if (charset2) mime += "; charset=" + charset2.toLowerCase();
      }
      return mime;
    }
    function extension(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var exts = match && exports2.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports2.types[extension2] || false;
    }
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type;
        }
      });
    }
  }
});

// ../../../../node_modules/type-is/index.js
var require_type_is = __commonJS({
  "../../../../node_modules/type-is/index.js"(exports2, module2) {
    "use strict";
    var typer = require_media_typer();
    var mime = require_mime_types();
    module2.exports = typeofrequest;
    module2.exports.is = typeis;
    module2.exports.hasBody = hasbody;
    module2.exports.normalize = normalize;
    module2.exports.match = mimeMatch;
    function typeis(value, types_) {
      var i;
      var types = types_;
      var val = tryNormalizeType(value);
      if (!val) {
        return false;
      }
      if (types && !Array.isArray(types)) {
        types = new Array(arguments.length - 1);
        for (i = 0; i < types.length; i++) {
          types[i] = arguments[i + 1];
        }
      }
      if (!types || !types.length) {
        return val;
      }
      var type;
      for (i = 0; i < types.length; i++) {
        if (mimeMatch(normalize(type = types[i]), val)) {
          return type[0] === "+" || type.indexOf("*") !== -1 ? val : type;
        }
      }
      return false;
    }
    function hasbody(req) {
      return req.headers["transfer-encoding"] !== void 0 || !isNaN(req.headers["content-length"]);
    }
    function typeofrequest(req, types_) {
      var types = types_;
      if (!hasbody(req)) {
        return null;
      }
      if (arguments.length > 2) {
        types = new Array(arguments.length - 1);
        for (var i = 0; i < types.length; i++) {
          types[i] = arguments[i + 1];
        }
      }
      var value = req.headers["content-type"];
      return typeis(value, types);
    }
    function normalize(type) {
      if (typeof type !== "string") {
        return false;
      }
      switch (type) {
        case "urlencoded":
          return "application/x-www-form-urlencoded";
        case "multipart":
          return "multipart/*";
      }
      if (type[0] === "+") {
        return "*/*" + type;
      }
      return type.indexOf("/") === -1 ? mime.lookup(type) : type;
    }
    function mimeMatch(expected, actual) {
      if (expected === false) {
        return false;
      }
      var actualParts = actual.split("/");
      var expectedParts = expected.split("/");
      if (actualParts.length !== 2 || expectedParts.length !== 2) {
        return false;
      }
      if (expectedParts[0] !== "*" && expectedParts[0] !== actualParts[0]) {
        return false;
      }
      if (expectedParts[1].substr(0, 2) === "*+") {
        return expectedParts[1].length <= actualParts[1].length + 1 && expectedParts[1].substr(1) === actualParts[1].substr(1 - expectedParts[1].length);
      }
      if (expectedParts[1] !== "*" && expectedParts[1] !== actualParts[1]) {
        return false;
      }
      return true;
    }
    function normalizeType(value) {
      var type = typer.parse(value);
      type.parameters = void 0;
      return typer.format(type);
    }
    function tryNormalizeType(value) {
      if (!value) {
        return null;
      }
      try {
        return normalizeType(value);
      } catch (err) {
        return null;
      }
    }
  }
});

// ../../../../node_modules/busboy/lib/utils.js
var require_utils = __commonJS({
  "../../../../node_modules/busboy/lib/utils.js"(exports2, module2) {
    "use strict";
    function parseContentType(str) {
      if (str.length === 0)
        return;
      const params = /* @__PURE__ */ Object.create(null);
      let i = 0;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (TOKEN[code] !== 1) {
          if (code !== 47 || i === 0)
            return;
          break;
        }
      }
      if (i === str.length)
        return;
      const type = str.slice(0, i).toLowerCase();
      const subtypeStart = ++i;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (TOKEN[code] !== 1) {
          if (i === subtypeStart)
            return;
          if (parseContentTypeParams(str, i, params) === void 0)
            return;
          break;
        }
      }
      if (i === subtypeStart)
        return;
      const subtype = str.slice(subtypeStart, i).toLowerCase();
      return { type, subtype, params };
    }
    function parseContentTypeParams(str, i, params) {
      while (i < str.length) {
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code !== 32 && code !== 9)
            break;
        }
        if (i === str.length)
          break;
        if (str.charCodeAt(i++) !== 59)
          return;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code !== 32 && code !== 9)
            break;
        }
        if (i === str.length)
          return;
        let name;
        const nameStart = i;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (TOKEN[code] !== 1) {
            if (code !== 61)
              return;
            break;
          }
        }
        if (i === str.length)
          return;
        name = str.slice(nameStart, i);
        ++i;
        if (i === str.length)
          return;
        let value = "";
        let valueStart;
        if (str.charCodeAt(i) === 34) {
          valueStart = ++i;
          let escaping = false;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (code === 92) {
              if (escaping) {
                valueStart = i;
                escaping = false;
              } else {
                value += str.slice(valueStart, i);
                escaping = true;
              }
              continue;
            }
            if (code === 34) {
              if (escaping) {
                valueStart = i;
                escaping = false;
                continue;
              }
              value += str.slice(valueStart, i);
              break;
            }
            if (escaping) {
              valueStart = i - 1;
              escaping = false;
            }
            if (QDTEXT[code] !== 1)
              return;
          }
          if (i === str.length)
            return;
          ++i;
        } else {
          valueStart = i;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (TOKEN[code] !== 1) {
              if (i === valueStart)
                return;
              break;
            }
          }
          value = str.slice(valueStart, i);
        }
        name = name.toLowerCase();
        if (params[name] === void 0)
          params[name] = value;
      }
      return params;
    }
    function parseDisposition(str, defDecoder) {
      if (str.length === 0)
        return;
      const params = /* @__PURE__ */ Object.create(null);
      let i = 0;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (TOKEN[code] !== 1) {
          if (parseDispositionParams(str, i, params, defDecoder) === void 0)
            return;
          break;
        }
      }
      const type = str.slice(0, i).toLowerCase();
      return { type, params };
    }
    function parseDispositionParams(str, i, params, defDecoder) {
      while (i < str.length) {
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code !== 32 && code !== 9)
            break;
        }
        if (i === str.length)
          break;
        if (str.charCodeAt(i++) !== 59)
          return;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code !== 32 && code !== 9)
            break;
        }
        if (i === str.length)
          return;
        let name;
        const nameStart = i;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (TOKEN[code] !== 1) {
            if (code === 61)
              break;
            return;
          }
        }
        if (i === str.length)
          return;
        let value = "";
        let valueStart;
        let charset;
        name = str.slice(nameStart, i);
        if (name.charCodeAt(name.length - 1) === 42) {
          const charsetStart = ++i;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (CHARSET[code] !== 1) {
              if (code !== 39)
                return;
              break;
            }
          }
          if (i === str.length)
            return;
          charset = str.slice(charsetStart, i);
          ++i;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (code === 39)
              break;
          }
          if (i === str.length)
            return;
          ++i;
          if (i === str.length)
            return;
          valueStart = i;
          let encode = 0;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (EXTENDED_VALUE[code] !== 1) {
              if (code === 37) {
                let hexUpper;
                let hexLower;
                if (i + 2 < str.length && (hexUpper = HEX_VALUES[str.charCodeAt(i + 1)]) !== -1 && (hexLower = HEX_VALUES[str.charCodeAt(i + 2)]) !== -1) {
                  const byteVal = (hexUpper << 4) + hexLower;
                  value += str.slice(valueStart, i);
                  value += String.fromCharCode(byteVal);
                  i += 2;
                  valueStart = i + 1;
                  if (byteVal >= 128)
                    encode = 2;
                  else if (encode === 0)
                    encode = 1;
                  continue;
                }
                return;
              }
              break;
            }
          }
          value += str.slice(valueStart, i);
          value = convertToUTF8(value, charset, encode);
          if (value === void 0)
            return;
        } else {
          ++i;
          if (i === str.length)
            return;
          if (str.charCodeAt(i) === 34) {
            valueStart = ++i;
            let escaping = false;
            for (; i < str.length; ++i) {
              const code = str.charCodeAt(i);
              if (code === 92) {
                if (escaping) {
                  valueStart = i;
                  escaping = false;
                } else {
                  value += str.slice(valueStart, i);
                  escaping = true;
                }
                continue;
              }
              if (code === 34) {
                if (escaping) {
                  valueStart = i;
                  escaping = false;
                  continue;
                }
                value += str.slice(valueStart, i);
                break;
              }
              if (escaping) {
                valueStart = i - 1;
                escaping = false;
              }
              if (QDTEXT[code] !== 1)
                return;
            }
            if (i === str.length)
              return;
            ++i;
          } else {
            valueStart = i;
            for (; i < str.length; ++i) {
              const code = str.charCodeAt(i);
              if (TOKEN[code] !== 1) {
                if (i === valueStart)
                  return;
                break;
              }
            }
            value = str.slice(valueStart, i);
          }
          value = defDecoder(value, 2);
          if (value === void 0)
            return;
        }
        name = name.toLowerCase();
        if (params[name] === void 0)
          params[name] = value;
      }
      return params;
    }
    function getDecoder(charset) {
      let lc;
      while (true) {
        switch (charset) {
          case "utf-8":
          case "utf8":
            return decoders.utf8;
          case "latin1":
          case "ascii":
          // TODO: Make these a separate, strict decoder?
          case "us-ascii":
          case "iso-8859-1":
          case "iso8859-1":
          case "iso88591":
          case "iso_8859-1":
          case "windows-1252":
          case "iso_8859-1:1987":
          case "cp1252":
          case "x-cp1252":
            return decoders.latin1;
          case "utf16le":
          case "utf-16le":
          case "ucs2":
          case "ucs-2":
            return decoders.utf16le;
          case "base64":
            return decoders.base64;
          default:
            if (lc === void 0) {
              lc = true;
              charset = charset.toLowerCase();
              continue;
            }
            return decoders.other.bind(charset);
        }
      }
    }
    var decoders = {
      utf8: (data, hint) => {
        if (data.length === 0)
          return "";
        if (typeof data === "string") {
          if (hint < 2)
            return data;
          data = Buffer.from(data, "latin1");
        }
        return data.utf8Slice(0, data.length);
      },
      latin1: (data, hint) => {
        if (data.length === 0)
          return "";
        if (typeof data === "string")
          return data;
        return data.latin1Slice(0, data.length);
      },
      utf16le: (data, hint) => {
        if (data.length === 0)
          return "";
        if (typeof data === "string")
          data = Buffer.from(data, "latin1");
        return data.ucs2Slice(0, data.length);
      },
      base64: (data, hint) => {
        if (data.length === 0)
          return "";
        if (typeof data === "string")
          data = Buffer.from(data, "latin1");
        return data.base64Slice(0, data.length);
      },
      other: (data, hint) => {
        if (data.length === 0)
          return "";
        if (typeof data === "string")
          data = Buffer.from(data, "latin1");
        try {
          const decoder = new TextDecoder(exports2);
          return decoder.decode(data);
        } catch {
        }
      }
    };
    function convertToUTF8(data, charset, hint) {
      const decode = getDecoder(charset);
      if (decode)
        return decode(data, hint);
    }
    function basename(path) {
      if (typeof path !== "string")
        return "";
      for (let i = path.length - 1; i >= 0; --i) {
        switch (path.charCodeAt(i)) {
          case 47:
          // '/'
          case 92:
            path = path.slice(i + 1);
            return path === ".." || path === "." ? "" : path;
        }
      }
      return path === ".." || path === "." ? "" : path;
    }
    var TOKEN = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    var QDTEXT = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ];
    var CHARSET = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    var EXTENDED_VALUE = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    var HEX_VALUES = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      10,
      11,
      12,
      13,
      14,
      15,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      10,
      11,
      12,
      13,
      14,
      15,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    module2.exports = {
      basename,
      convertToUTF8,
      getDecoder,
      parseContentType,
      parseDisposition
    };
  }
});

// ../../../../node_modules/streamsearch/lib/sbmh.js
var require_sbmh = __commonJS({
  "../../../../node_modules/streamsearch/lib/sbmh.js"(exports2, module2) {
    "use strict";
    function memcmp(buf1, pos1, buf2, pos2, num) {
      for (let i = 0; i < num; ++i) {
        if (buf1[pos1 + i] !== buf2[pos2 + i])
          return false;
      }
      return true;
    }
    var SBMH = class {
      constructor(needle, cb) {
        if (typeof cb !== "function")
          throw new Error("Missing match callback");
        if (typeof needle === "string")
          needle = Buffer.from(needle);
        else if (!Buffer.isBuffer(needle))
          throw new Error(`Expected Buffer for needle, got ${typeof needle}`);
        const needleLen = needle.length;
        this.maxMatches = Infinity;
        this.matches = 0;
        this._cb = cb;
        this._lookbehindSize = 0;
        this._needle = needle;
        this._bufPos = 0;
        this._lookbehind = Buffer.allocUnsafe(needleLen);
        this._occ = [
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen,
          needleLen
        ];
        if (needleLen > 1) {
          for (let i = 0; i < needleLen - 1; ++i)
            this._occ[needle[i]] = needleLen - 1 - i;
        }
      }
      reset() {
        this.matches = 0;
        this._lookbehindSize = 0;
        this._bufPos = 0;
      }
      push(chunk, pos) {
        let result;
        if (!Buffer.isBuffer(chunk))
          chunk = Buffer.from(chunk, "latin1");
        const chunkLen = chunk.length;
        this._bufPos = pos || 0;
        while (result !== chunkLen && this.matches < this.maxMatches)
          result = feed(this, chunk);
        return result;
      }
      destroy() {
        const lbSize = this._lookbehindSize;
        if (lbSize)
          this._cb(false, this._lookbehind, 0, lbSize, false);
        this.reset();
      }
    };
    function feed(self2, data) {
      const len = data.length;
      const needle = self2._needle;
      const needleLen = needle.length;
      let pos = -self2._lookbehindSize;
      const lastNeedleCharPos = needleLen - 1;
      const lastNeedleChar = needle[lastNeedleCharPos];
      const end = len - needleLen;
      const occ = self2._occ;
      const lookbehind = self2._lookbehind;
      if (pos < 0) {
        while (pos < 0 && pos <= end) {
          const nextPos = pos + lastNeedleCharPos;
          const ch = nextPos < 0 ? lookbehind[self2._lookbehindSize + nextPos] : data[nextPos];
          if (ch === lastNeedleChar && matchNeedle(self2, data, pos, lastNeedleCharPos)) {
            self2._lookbehindSize = 0;
            ++self2.matches;
            if (pos > -self2._lookbehindSize)
              self2._cb(true, lookbehind, 0, self2._lookbehindSize + pos, false);
            else
              self2._cb(true, void 0, 0, 0, true);
            return self2._bufPos = pos + needleLen;
          }
          pos += occ[ch];
        }
        while (pos < 0 && !matchNeedle(self2, data, pos, len - pos))
          ++pos;
        if (pos < 0) {
          const bytesToCutOff = self2._lookbehindSize + pos;
          if (bytesToCutOff > 0) {
            self2._cb(false, lookbehind, 0, bytesToCutOff, false);
          }
          self2._lookbehindSize -= bytesToCutOff;
          lookbehind.copy(lookbehind, 0, bytesToCutOff, self2._lookbehindSize);
          lookbehind.set(data, self2._lookbehindSize);
          self2._lookbehindSize += len;
          self2._bufPos = len;
          return len;
        }
        self2._cb(false, lookbehind, 0, self2._lookbehindSize, false);
        self2._lookbehindSize = 0;
      }
      pos += self2._bufPos;
      const firstNeedleChar = needle[0];
      while (pos <= end) {
        const ch = data[pos + lastNeedleCharPos];
        if (ch === lastNeedleChar && data[pos] === firstNeedleChar && memcmp(needle, 0, data, pos, lastNeedleCharPos)) {
          ++self2.matches;
          if (pos > 0)
            self2._cb(true, data, self2._bufPos, pos, true);
          else
            self2._cb(true, void 0, 0, 0, true);
          return self2._bufPos = pos + needleLen;
        }
        pos += occ[ch];
      }
      while (pos < len) {
        if (data[pos] !== firstNeedleChar || !memcmp(data, pos, needle, 0, len - pos)) {
          ++pos;
          continue;
        }
        data.copy(lookbehind, 0, pos, len);
        self2._lookbehindSize = len - pos;
        break;
      }
      if (pos > 0)
        self2._cb(false, data, self2._bufPos, pos < len ? pos : len, true);
      self2._bufPos = len;
      return len;
    }
    function matchNeedle(self2, data, pos, len) {
      const lb = self2._lookbehind;
      const lbSize = self2._lookbehindSize;
      const needle = self2._needle;
      for (let i = 0; i < len; ++i, ++pos) {
        const ch = pos < 0 ? lb[lbSize + pos] : data[pos];
        if (ch !== needle[i])
          return false;
      }
      return true;
    }
    module2.exports = SBMH;
  }
});

// ../../../../node_modules/busboy/lib/types/multipart.js
var require_multipart = __commonJS({
  "../../../../node_modules/busboy/lib/types/multipart.js"(exports2, module2) {
    "use strict";
    var { Readable, Writable } = require("stream");
    var StreamSearch = require_sbmh();
    var {
      basename,
      convertToUTF8,
      getDecoder,
      parseContentType,
      parseDisposition
    } = require_utils();
    var BUF_CRLF = Buffer.from("\r\n");
    var BUF_CR = Buffer.from("\r");
    var BUF_DASH = Buffer.from("-");
    function noop2() {
    }
    var MAX_HEADER_PAIRS = 2e3;
    var MAX_HEADER_SIZE = 16 * 1024;
    var HPARSER_NAME = 0;
    var HPARSER_PRE_OWS = 1;
    var HPARSER_VALUE = 2;
    var HeaderParser = class {
      constructor(cb) {
        this.header = /* @__PURE__ */ Object.create(null);
        this.pairCount = 0;
        this.byteCount = 0;
        this.state = HPARSER_NAME;
        this.name = "";
        this.value = "";
        this.crlf = 0;
        this.cb = cb;
      }
      reset() {
        this.header = /* @__PURE__ */ Object.create(null);
        this.pairCount = 0;
        this.byteCount = 0;
        this.state = HPARSER_NAME;
        this.name = "";
        this.value = "";
        this.crlf = 0;
      }
      push(chunk, pos, end) {
        let start = pos;
        while (pos < end) {
          switch (this.state) {
            case HPARSER_NAME: {
              let done = false;
              for (; pos < end; ++pos) {
                if (this.byteCount === MAX_HEADER_SIZE)
                  return -1;
                ++this.byteCount;
                const code = chunk[pos];
                if (TOKEN[code] !== 1) {
                  if (code !== 58)
                    return -1;
                  this.name += chunk.latin1Slice(start, pos);
                  if (this.name.length === 0)
                    return -1;
                  ++pos;
                  done = true;
                  this.state = HPARSER_PRE_OWS;
                  break;
                }
              }
              if (!done) {
                this.name += chunk.latin1Slice(start, pos);
                break;
              }
            }
            case HPARSER_PRE_OWS: {
              let done = false;
              for (; pos < end; ++pos) {
                if (this.byteCount === MAX_HEADER_SIZE)
                  return -1;
                ++this.byteCount;
                const code = chunk[pos];
                if (code !== 32 && code !== 9) {
                  start = pos;
                  done = true;
                  this.state = HPARSER_VALUE;
                  break;
                }
              }
              if (!done)
                break;
            }
            case HPARSER_VALUE:
              switch (this.crlf) {
                case 0:
                  for (; pos < end; ++pos) {
                    if (this.byteCount === MAX_HEADER_SIZE)
                      return -1;
                    ++this.byteCount;
                    const code = chunk[pos];
                    if (FIELD_VCHAR[code] !== 1) {
                      if (code !== 13)
                        return -1;
                      ++this.crlf;
                      break;
                    }
                  }
                  this.value += chunk.latin1Slice(start, pos++);
                  break;
                case 1:
                  if (this.byteCount === MAX_HEADER_SIZE)
                    return -1;
                  ++this.byteCount;
                  if (chunk[pos++] !== 10)
                    return -1;
                  ++this.crlf;
                  break;
                case 2: {
                  if (this.byteCount === MAX_HEADER_SIZE)
                    return -1;
                  ++this.byteCount;
                  const code = chunk[pos];
                  if (code === 32 || code === 9) {
                    start = pos;
                    this.crlf = 0;
                  } else {
                    if (++this.pairCount < MAX_HEADER_PAIRS) {
                      this.name = this.name.toLowerCase();
                      if (this.header[this.name] === void 0)
                        this.header[this.name] = [this.value];
                      else
                        this.header[this.name].push(this.value);
                    }
                    if (code === 13) {
                      ++this.crlf;
                      ++pos;
                    } else {
                      start = pos;
                      this.crlf = 0;
                      this.state = HPARSER_NAME;
                      this.name = "";
                      this.value = "";
                    }
                  }
                  break;
                }
                case 3: {
                  if (this.byteCount === MAX_HEADER_SIZE)
                    return -1;
                  ++this.byteCount;
                  if (chunk[pos++] !== 10)
                    return -1;
                  const header = this.header;
                  this.reset();
                  this.cb(header);
                  return pos;
                }
              }
              break;
          }
        }
        return pos;
      }
    };
    var FileStream = class extends Readable {
      constructor(opts, owner) {
        super(opts);
        this.truncated = false;
        this._readcb = null;
        this.once("end", () => {
          this._read();
          if (--owner._fileEndsLeft === 0 && owner._finalcb) {
            const cb = owner._finalcb;
            owner._finalcb = null;
            process.nextTick(cb);
          }
        });
      }
      _read(n) {
        const cb = this._readcb;
        if (cb) {
          this._readcb = null;
          cb();
        }
      }
    };
    var ignoreData = {
      push: (chunk, pos) => {
      },
      destroy: () => {
      }
    };
    function callAndUnsetCb(self2, err) {
      const cb = self2._writecb;
      self2._writecb = null;
      if (err)
        self2.destroy(err);
      else if (cb)
        cb();
    }
    function nullDecoder(val, hint) {
      return val;
    }
    var Multipart = class extends Writable {
      constructor(cfg) {
        const streamOpts = {
          autoDestroy: true,
          emitClose: true,
          highWaterMark: typeof cfg.highWaterMark === "number" ? cfg.highWaterMark : void 0
        };
        super(streamOpts);
        if (!cfg.conType.params || typeof cfg.conType.params.boundary !== "string")
          throw new Error("Multipart: Boundary not found");
        const boundary = cfg.conType.params.boundary;
        const paramDecoder = typeof cfg.defParamCharset === "string" && cfg.defParamCharset ? getDecoder(cfg.defParamCharset) : nullDecoder;
        const defCharset = cfg.defCharset || "utf8";
        const preservePath = cfg.preservePath;
        const fileOpts = {
          autoDestroy: true,
          emitClose: true,
          highWaterMark: typeof cfg.fileHwm === "number" ? cfg.fileHwm : void 0
        };
        const limits = cfg.limits;
        const fieldSizeLimit = limits && typeof limits.fieldSize === "number" ? limits.fieldSize : 1 * 1024 * 1024;
        const fileSizeLimit = limits && typeof limits.fileSize === "number" ? limits.fileSize : Infinity;
        const filesLimit = limits && typeof limits.files === "number" ? limits.files : Infinity;
        const fieldsLimit = limits && typeof limits.fields === "number" ? limits.fields : Infinity;
        const partsLimit = limits && typeof limits.parts === "number" ? limits.parts : Infinity;
        let parts = -1;
        let fields = 0;
        let files = 0;
        let skipPart = false;
        this._fileEndsLeft = 0;
        this._fileStream = void 0;
        this._complete = false;
        let fileSize = 0;
        let field;
        let fieldSize = 0;
        let partCharset;
        let partEncoding;
        let partType;
        let partName;
        let partTruncated = false;
        let hitFilesLimit = false;
        let hitFieldsLimit = false;
        this._hparser = null;
        const hparser = new HeaderParser((header) => {
          this._hparser = null;
          skipPart = false;
          partType = "text/plain";
          partCharset = defCharset;
          partEncoding = "7bit";
          partName = void 0;
          partTruncated = false;
          let filename;
          if (!header["content-disposition"]) {
            skipPart = true;
            return;
          }
          const disp = parseDisposition(
            header["content-disposition"][0],
            paramDecoder
          );
          if (!disp || disp.type !== "form-data") {
            skipPart = true;
            return;
          }
          if (disp.params) {
            if (disp.params.name)
              partName = disp.params.name;
            if (disp.params["filename*"])
              filename = disp.params["filename*"];
            else if (disp.params.filename)
              filename = disp.params.filename;
            if (filename !== void 0 && !preservePath)
              filename = basename(filename);
          }
          if (header["content-type"]) {
            const conType = parseContentType(header["content-type"][0]);
            if (conType) {
              partType = `${conType.type}/${conType.subtype}`;
              if (conType.params && typeof conType.params.charset === "string")
                partCharset = conType.params.charset.toLowerCase();
            }
          }
          if (header["content-transfer-encoding"])
            partEncoding = header["content-transfer-encoding"][0].toLowerCase();
          if (partType === "application/octet-stream" || filename !== void 0) {
            if (files === filesLimit) {
              if (!hitFilesLimit) {
                hitFilesLimit = true;
                this.emit("filesLimit");
              }
              skipPart = true;
              return;
            }
            ++files;
            if (this.listenerCount("file") === 0) {
              skipPart = true;
              return;
            }
            fileSize = 0;
            this._fileStream = new FileStream(fileOpts, this);
            ++this._fileEndsLeft;
            this.emit(
              "file",
              partName,
              this._fileStream,
              {
                filename,
                encoding: partEncoding,
                mimeType: partType
              }
            );
          } else {
            if (fields === fieldsLimit) {
              if (!hitFieldsLimit) {
                hitFieldsLimit = true;
                this.emit("fieldsLimit");
              }
              skipPart = true;
              return;
            }
            ++fields;
            if (this.listenerCount("field") === 0) {
              skipPart = true;
              return;
            }
            field = [];
            fieldSize = 0;
          }
        });
        let matchPostBoundary = 0;
        const ssCb = (isMatch, data, start, end, isDataSafe) => {
          retrydata:
            while (data) {
              if (this._hparser !== null) {
                const ret = this._hparser.push(data, start, end);
                if (ret === -1) {
                  this._hparser = null;
                  hparser.reset();
                  this.emit("error", new Error("Malformed part header"));
                  break;
                }
                start = ret;
              }
              if (start === end)
                break;
              if (matchPostBoundary !== 0) {
                if (matchPostBoundary === 1) {
                  switch (data[start]) {
                    case 45:
                      matchPostBoundary = 2;
                      ++start;
                      break;
                    case 13:
                      matchPostBoundary = 3;
                      ++start;
                      break;
                    default:
                      matchPostBoundary = 0;
                  }
                  if (start === end)
                    return;
                }
                if (matchPostBoundary === 2) {
                  matchPostBoundary = 0;
                  if (data[start] === 45) {
                    this._complete = true;
                    this._bparser = ignoreData;
                    return;
                  }
                  const writecb = this._writecb;
                  this._writecb = noop2;
                  ssCb(false, BUF_DASH, 0, 1, false);
                  this._writecb = writecb;
                } else if (matchPostBoundary === 3) {
                  matchPostBoundary = 0;
                  if (data[start] === 10) {
                    ++start;
                    if (parts >= partsLimit)
                      break;
                    this._hparser = hparser;
                    if (start === end)
                      break;
                    continue retrydata;
                  } else {
                    const writecb = this._writecb;
                    this._writecb = noop2;
                    ssCb(false, BUF_CR, 0, 1, false);
                    this._writecb = writecb;
                  }
                }
              }
              if (!skipPart) {
                if (this._fileStream) {
                  let chunk;
                  const actualLen = Math.min(end - start, fileSizeLimit - fileSize);
                  if (!isDataSafe) {
                    chunk = Buffer.allocUnsafe(actualLen);
                    data.copy(chunk, 0, start, start + actualLen);
                  } else {
                    chunk = data.slice(start, start + actualLen);
                  }
                  fileSize += chunk.length;
                  if (fileSize === fileSizeLimit) {
                    if (chunk.length > 0)
                      this._fileStream.push(chunk);
                    this._fileStream.emit("limit");
                    this._fileStream.truncated = true;
                    skipPart = true;
                  } else if (!this._fileStream.push(chunk)) {
                    if (this._writecb)
                      this._fileStream._readcb = this._writecb;
                    this._writecb = null;
                  }
                } else if (field !== void 0) {
                  let chunk;
                  const actualLen = Math.min(
                    end - start,
                    fieldSizeLimit - fieldSize
                  );
                  if (!isDataSafe) {
                    chunk = Buffer.allocUnsafe(actualLen);
                    data.copy(chunk, 0, start, start + actualLen);
                  } else {
                    chunk = data.slice(start, start + actualLen);
                  }
                  fieldSize += actualLen;
                  field.push(chunk);
                  if (fieldSize === fieldSizeLimit) {
                    skipPart = true;
                    partTruncated = true;
                  }
                }
              }
              break;
            }
          if (isMatch) {
            matchPostBoundary = 1;
            if (this._fileStream) {
              this._fileStream.push(null);
              this._fileStream = null;
            } else if (field !== void 0) {
              let data2;
              switch (field.length) {
                case 0:
                  data2 = "";
                  break;
                case 1:
                  data2 = convertToUTF8(field[0], partCharset, 0);
                  break;
                default:
                  data2 = convertToUTF8(
                    Buffer.concat(field, fieldSize),
                    partCharset,
                    0
                  );
              }
              field = void 0;
              fieldSize = 0;
              this.emit(
                "field",
                partName,
                data2,
                {
                  nameTruncated: false,
                  valueTruncated: partTruncated,
                  encoding: partEncoding,
                  mimeType: partType
                }
              );
            }
            if (++parts === partsLimit)
              this.emit("partsLimit");
          }
        };
        this._bparser = new StreamSearch(`\r
--${boundary}`, ssCb);
        this._writecb = null;
        this._finalcb = null;
        this.write(BUF_CRLF);
      }
      static detect(conType) {
        return conType.type === "multipart" && conType.subtype === "form-data";
      }
      _write(chunk, enc, cb) {
        this._writecb = cb;
        this._bparser.push(chunk, 0);
        if (this._writecb)
          callAndUnsetCb(this);
      }
      _destroy(err, cb) {
        this._hparser = null;
        this._bparser = ignoreData;
        if (!err)
          err = checkEndState(this);
        const fileStream = this._fileStream;
        if (fileStream) {
          this._fileStream = null;
          fileStream.destroy(err);
        }
        cb(err);
      }
      _final(cb) {
        this._bparser.destroy();
        if (!this._complete)
          return cb(new Error("Unexpected end of form"));
        if (this._fileEndsLeft)
          this._finalcb = finalcb.bind(null, this, cb);
        else
          finalcb(this, cb);
      }
    };
    function finalcb(self2, cb, err) {
      if (err)
        return cb(err);
      err = checkEndState(self2);
      cb(err);
    }
    function checkEndState(self2) {
      if (self2._hparser)
        return new Error("Malformed part header");
      const fileStream = self2._fileStream;
      if (fileStream) {
        self2._fileStream = null;
        fileStream.destroy(new Error("Unexpected end of file"));
      }
      if (!self2._complete)
        return new Error("Unexpected end of form");
    }
    var TOKEN = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    var FIELD_VCHAR = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ];
    module2.exports = Multipart;
  }
});

// ../../../../node_modules/busboy/lib/types/urlencoded.js
var require_urlencoded = __commonJS({
  "../../../../node_modules/busboy/lib/types/urlencoded.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var { getDecoder } = require_utils();
    var URLEncoded = class extends Writable {
      constructor(cfg) {
        const streamOpts = {
          autoDestroy: true,
          emitClose: true,
          highWaterMark: typeof cfg.highWaterMark === "number" ? cfg.highWaterMark : void 0
        };
        super(streamOpts);
        let charset = cfg.defCharset || "utf8";
        if (cfg.conType.params && typeof cfg.conType.params.charset === "string")
          charset = cfg.conType.params.charset;
        this.charset = charset;
        const limits = cfg.limits;
        this.fieldSizeLimit = limits && typeof limits.fieldSize === "number" ? limits.fieldSize : 1 * 1024 * 1024;
        this.fieldsLimit = limits && typeof limits.fields === "number" ? limits.fields : Infinity;
        this.fieldNameSizeLimit = limits && typeof limits.fieldNameSize === "number" ? limits.fieldNameSize : 100;
        this._inKey = true;
        this._keyTrunc = false;
        this._valTrunc = false;
        this._bytesKey = 0;
        this._bytesVal = 0;
        this._fields = 0;
        this._key = "";
        this._val = "";
        this._byte = -2;
        this._lastPos = 0;
        this._encode = 0;
        this._decoder = getDecoder(charset);
      }
      static detect(conType) {
        return conType.type === "application" && conType.subtype === "x-www-form-urlencoded";
      }
      _write(chunk, enc, cb) {
        if (this._fields >= this.fieldsLimit)
          return cb();
        let i = 0;
        const len = chunk.length;
        this._lastPos = 0;
        if (this._byte !== -2) {
          i = readPctEnc(this, chunk, i, len);
          if (i === -1)
            return cb(new Error("Malformed urlencoded form"));
          if (i >= len)
            return cb();
          if (this._inKey)
            ++this._bytesKey;
          else
            ++this._bytesVal;
        }
        main:
          while (i < len) {
            if (this._inKey) {
              i = skipKeyBytes(this, chunk, i, len);
              while (i < len) {
                switch (chunk[i]) {
                  case 61:
                    if (this._lastPos < i)
                      this._key += chunk.latin1Slice(this._lastPos, i);
                    this._lastPos = ++i;
                    this._key = this._decoder(this._key, this._encode);
                    this._encode = 0;
                    this._inKey = false;
                    continue main;
                  case 38:
                    if (this._lastPos < i)
                      this._key += chunk.latin1Slice(this._lastPos, i);
                    this._lastPos = ++i;
                    this._key = this._decoder(this._key, this._encode);
                    this._encode = 0;
                    if (this._bytesKey > 0) {
                      this.emit(
                        "field",
                        this._key,
                        "",
                        {
                          nameTruncated: this._keyTrunc,
                          valueTruncated: false,
                          encoding: this.charset,
                          mimeType: "text/plain"
                        }
                      );
                    }
                    this._key = "";
                    this._val = "";
                    this._keyTrunc = false;
                    this._valTrunc = false;
                    this._bytesKey = 0;
                    this._bytesVal = 0;
                    if (++this._fields >= this.fieldsLimit) {
                      this.emit("fieldsLimit");
                      return cb();
                    }
                    continue;
                  case 43:
                    if (this._lastPos < i)
                      this._key += chunk.latin1Slice(this._lastPos, i);
                    this._key += " ";
                    this._lastPos = i + 1;
                    break;
                  case 37:
                    if (this._encode === 0)
                      this._encode = 1;
                    if (this._lastPos < i)
                      this._key += chunk.latin1Slice(this._lastPos, i);
                    this._lastPos = i + 1;
                    this._byte = -1;
                    i = readPctEnc(this, chunk, i + 1, len);
                    if (i === -1)
                      return cb(new Error("Malformed urlencoded form"));
                    if (i >= len)
                      return cb();
                    ++this._bytesKey;
                    i = skipKeyBytes(this, chunk, i, len);
                    continue;
                }
                ++i;
                ++this._bytesKey;
                i = skipKeyBytes(this, chunk, i, len);
              }
              if (this._lastPos < i)
                this._key += chunk.latin1Slice(this._lastPos, i);
            } else {
              i = skipValBytes(this, chunk, i, len);
              while (i < len) {
                switch (chunk[i]) {
                  case 38:
                    if (this._lastPos < i)
                      this._val += chunk.latin1Slice(this._lastPos, i);
                    this._lastPos = ++i;
                    this._inKey = true;
                    this._val = this._decoder(this._val, this._encode);
                    this._encode = 0;
                    if (this._bytesKey > 0 || this._bytesVal > 0) {
                      this.emit(
                        "field",
                        this._key,
                        this._val,
                        {
                          nameTruncated: this._keyTrunc,
                          valueTruncated: this._valTrunc,
                          encoding: this.charset,
                          mimeType: "text/plain"
                        }
                      );
                    }
                    this._key = "";
                    this._val = "";
                    this._keyTrunc = false;
                    this._valTrunc = false;
                    this._bytesKey = 0;
                    this._bytesVal = 0;
                    if (++this._fields >= this.fieldsLimit) {
                      this.emit("fieldsLimit");
                      return cb();
                    }
                    continue main;
                  case 43:
                    if (this._lastPos < i)
                      this._val += chunk.latin1Slice(this._lastPos, i);
                    this._val += " ";
                    this._lastPos = i + 1;
                    break;
                  case 37:
                    if (this._encode === 0)
                      this._encode = 1;
                    if (this._lastPos < i)
                      this._val += chunk.latin1Slice(this._lastPos, i);
                    this._lastPos = i + 1;
                    this._byte = -1;
                    i = readPctEnc(this, chunk, i + 1, len);
                    if (i === -1)
                      return cb(new Error("Malformed urlencoded form"));
                    if (i >= len)
                      return cb();
                    ++this._bytesVal;
                    i = skipValBytes(this, chunk, i, len);
                    continue;
                }
                ++i;
                ++this._bytesVal;
                i = skipValBytes(this, chunk, i, len);
              }
              if (this._lastPos < i)
                this._val += chunk.latin1Slice(this._lastPos, i);
            }
          }
        cb();
      }
      _final(cb) {
        if (this._byte !== -2)
          return cb(new Error("Malformed urlencoded form"));
        if (!this._inKey || this._bytesKey > 0 || this._bytesVal > 0) {
          if (this._inKey)
            this._key = this._decoder(this._key, this._encode);
          else
            this._val = this._decoder(this._val, this._encode);
          this.emit(
            "field",
            this._key,
            this._val,
            {
              nameTruncated: this._keyTrunc,
              valueTruncated: this._valTrunc,
              encoding: this.charset,
              mimeType: "text/plain"
            }
          );
        }
        cb();
      }
    };
    function readPctEnc(self2, chunk, pos, len) {
      if (pos >= len)
        return len;
      if (self2._byte === -1) {
        const hexUpper = HEX_VALUES[chunk[pos++]];
        if (hexUpper === -1)
          return -1;
        if (hexUpper >= 8)
          self2._encode = 2;
        if (pos < len) {
          const hexLower = HEX_VALUES[chunk[pos++]];
          if (hexLower === -1)
            return -1;
          if (self2._inKey)
            self2._key += String.fromCharCode((hexUpper << 4) + hexLower);
          else
            self2._val += String.fromCharCode((hexUpper << 4) + hexLower);
          self2._byte = -2;
          self2._lastPos = pos;
        } else {
          self2._byte = hexUpper;
        }
      } else {
        const hexLower = HEX_VALUES[chunk[pos++]];
        if (hexLower === -1)
          return -1;
        if (self2._inKey)
          self2._key += String.fromCharCode((self2._byte << 4) + hexLower);
        else
          self2._val += String.fromCharCode((self2._byte << 4) + hexLower);
        self2._byte = -2;
        self2._lastPos = pos;
      }
      return pos;
    }
    function skipKeyBytes(self2, chunk, pos, len) {
      if (self2._bytesKey > self2.fieldNameSizeLimit) {
        if (!self2._keyTrunc) {
          if (self2._lastPos < pos)
            self2._key += chunk.latin1Slice(self2._lastPos, pos - 1);
        }
        self2._keyTrunc = true;
        for (; pos < len; ++pos) {
          const code = chunk[pos];
          if (code === 61 || code === 38)
            break;
          ++self2._bytesKey;
        }
        self2._lastPos = pos;
      }
      return pos;
    }
    function skipValBytes(self2, chunk, pos, len) {
      if (self2._bytesVal > self2.fieldSizeLimit) {
        if (!self2._valTrunc) {
          if (self2._lastPos < pos)
            self2._val += chunk.latin1Slice(self2._lastPos, pos - 1);
        }
        self2._valTrunc = true;
        for (; pos < len; ++pos) {
          if (chunk[pos] === 38)
            break;
          ++self2._bytesVal;
        }
        self2._lastPos = pos;
      }
      return pos;
    }
    var HEX_VALUES = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      10,
      11,
      12,
      13,
      14,
      15,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      10,
      11,
      12,
      13,
      14,
      15,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    module2.exports = URLEncoded;
  }
});

// ../../../../node_modules/busboy/lib/index.js
var require_lib = __commonJS({
  "../../../../node_modules/busboy/lib/index.js"(exports2, module2) {
    "use strict";
    var { parseContentType } = require_utils();
    function getInstance(cfg) {
      const headers = cfg.headers;
      const conType = parseContentType(headers["content-type"]);
      if (!conType)
        throw new Error("Malformed content type");
      for (const type of TYPES) {
        const matched = type.detect(conType);
        if (!matched)
          continue;
        const instanceCfg = {
          limits: cfg.limits,
          headers,
          conType,
          highWaterMark: void 0,
          fileHwm: void 0,
          defCharset: void 0,
          defParamCharset: void 0,
          preservePath: false
        };
        if (cfg.highWaterMark)
          instanceCfg.highWaterMark = cfg.highWaterMark;
        if (cfg.fileHwm)
          instanceCfg.fileHwm = cfg.fileHwm;
        instanceCfg.defCharset = cfg.defCharset;
        instanceCfg.defParamCharset = cfg.defParamCharset;
        instanceCfg.preservePath = cfg.preservePath;
        return new type(instanceCfg);
      }
      throw new Error(`Unsupported content type: ${headers["content-type"]}`);
    }
    var TYPES = [
      require_multipart(),
      require_urlencoded()
    ].filter(function(typemod) {
      return typeof typemod.detect === "function";
    });
    module2.exports = (cfg) => {
      if (typeof cfg !== "object" || cfg === null)
        cfg = {};
      if (typeof cfg.headers !== "object" || cfg.headers === null || typeof cfg.headers["content-type"] !== "string") {
        throw new Error("Missing Content-Type");
      }
      return getInstance(cfg);
    };
  }
});

// ../../../../node_modules/append-field/lib/parse-path.js
var require_parse_path = __commonJS({
  "../../../../node_modules/append-field/lib/parse-path.js"(exports2, module2) {
    "use strict";
    var reFirstKey = /^[^\[]*/;
    var reDigitPath = /^\[(\d+)\]/;
    var reNormalPath = /^\[([^\]]+)\]/;
    function parsePath(key) {
      function failure() {
        return [{ type: "object", key, last: true }];
      }
      var firstKey = reFirstKey.exec(key)[0];
      if (!firstKey) return failure();
      var len = key.length;
      var pos = firstKey.length;
      var tail = { type: "object", key: firstKey };
      var steps = [tail];
      while (pos < len) {
        var m;
        if (key[pos] === "[" && key[pos + 1] === "]") {
          pos += 2;
          tail.append = true;
          if (pos !== len) return failure();
          continue;
        }
        m = reDigitPath.exec(key.substring(pos));
        if (m !== null) {
          pos += m[0].length;
          tail.nextType = "array";
          tail = { type: "array", key: parseInt(m[1], 10) };
          steps.push(tail);
          continue;
        }
        m = reNormalPath.exec(key.substring(pos));
        if (m !== null) {
          pos += m[0].length;
          tail.nextType = "object";
          tail = { type: "object", key: m[1] };
          steps.push(tail);
          continue;
        }
        return failure();
      }
      tail.last = true;
      return steps;
    }
    module2.exports = parsePath;
  }
});

// ../../../../node_modules/append-field/lib/set-value.js
var require_set_value = __commonJS({
  "../../../../node_modules/append-field/lib/set-value.js"(exports2, module2) {
    "use strict";
    function valueType(value) {
      if (value === void 0) return "undefined";
      if (Array.isArray(value)) return "array";
      if (typeof value === "object") return "object";
      return "scalar";
    }
    function setLastValue(context, step, currentValue, entryValue) {
      switch (valueType(currentValue)) {
        case "undefined":
          if (step.append) {
            context[step.key] = [entryValue];
          } else {
            context[step.key] = entryValue;
          }
          break;
        case "array":
          context[step.key].push(entryValue);
          break;
        case "object":
          return setLastValue(currentValue, { type: "object", key: "", last: true }, currentValue[""], entryValue);
        case "scalar":
          context[step.key] = [context[step.key], entryValue];
          break;
      }
      return context;
    }
    function setValue(context, step, currentValue, entryValue) {
      if (step.last) return setLastValue(context, step, currentValue, entryValue);
      var obj;
      switch (valueType(currentValue)) {
        case "undefined":
          if (step.nextType === "array") {
            context[step.key] = [];
          } else {
            context[step.key] = /* @__PURE__ */ Object.create(null);
          }
          return context[step.key];
        case "object":
          return context[step.key];
        case "array":
          if (step.nextType === "array") {
            return currentValue;
          }
          obj = /* @__PURE__ */ Object.create(null);
          context[step.key] = obj;
          currentValue.forEach(function(item, i) {
            if (item !== void 0) obj["" + i] = item;
          });
          return obj;
        case "scalar":
          obj = /* @__PURE__ */ Object.create(null);
          obj[""] = currentValue;
          context[step.key] = obj;
          return obj;
      }
    }
    module2.exports = setValue;
  }
});

// ../../../../node_modules/append-field/index.js
var require_append_field = __commonJS({
  "../../../../node_modules/append-field/index.js"(exports2, module2) {
    "use strict";
    var parsePath = require_parse_path();
    var setValue = require_set_value();
    function appendField(store, key, value) {
      var steps = parsePath(key);
      steps.reduce(function(context, step) {
        return setValue(context, step, context[step.key], value);
      }, store);
    }
    module2.exports = appendField;
  }
});

// ../../../../node_modules/multer/lib/counter.js
var require_counter = __commonJS({
  "../../../../node_modules/multer/lib/counter.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    function Counter() {
      EventEmitter.call(this);
      this.value = 0;
    }
    Counter.prototype = Object.create(EventEmitter.prototype);
    Counter.prototype.increment = function increment() {
      this.value++;
    };
    Counter.prototype.decrement = function decrement() {
      if (--this.value === 0) this.emit("zero");
    };
    Counter.prototype.isZero = function isZero() {
      return this.value === 0;
    };
    Counter.prototype.onceZero = function onceZero(fn) {
      if (this.isZero()) return fn();
      this.once("zero", fn);
    };
    module2.exports = Counter;
  }
});

// ../../../../node_modules/multer/lib/multer-error.js
var require_multer_error = __commonJS({
  "../../../../node_modules/multer/lib/multer-error.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var errorMessages = {
      LIMIT_PART_COUNT: "Too many parts",
      LIMIT_FILE_SIZE: "File too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_FIELD_KEY: "Field name too long",
      LIMIT_FIELD_VALUE: "Field value too long",
      LIMIT_FIELD_COUNT: "Too many fields",
      LIMIT_UNEXPECTED_FILE: "Unexpected field",
      MISSING_FIELD_NAME: "Field name missing"
    };
    function MulterError(code, field) {
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = errorMessages[code];
      this.code = code;
      if (field) this.field = field;
    }
    util.inherits(MulterError, Error);
    module2.exports = MulterError;
  }
});

// ../../../../node_modules/multer/lib/file-appender.js
var require_file_appender = __commonJS({
  "../../../../node_modules/multer/lib/file-appender.js"(exports2, module2) {
    "use strict";
    function arrayRemove(arr, item) {
      var idx = arr.indexOf(item);
      if (~idx) arr.splice(idx, 1);
    }
    function FileAppender(strategy, req) {
      this.strategy = strategy;
      this.req = req;
      switch (strategy) {
        case "NONE":
          break;
        case "VALUE":
          break;
        case "ARRAY":
          req.files = [];
          break;
        case "OBJECT":
          req.files = /* @__PURE__ */ Object.create(null);
          break;
        default:
          throw new Error("Unknown file strategy: " + strategy);
      }
    }
    FileAppender.prototype.insertPlaceholder = function(file) {
      var placeholder = {
        fieldname: file.fieldname
      };
      switch (this.strategy) {
        case "NONE":
          break;
        case "VALUE":
          break;
        case "ARRAY":
          this.req.files.push(placeholder);
          break;
        case "OBJECT":
          if (this.req.files[file.fieldname]) {
            this.req.files[file.fieldname].push(placeholder);
          } else {
            this.req.files[file.fieldname] = [placeholder];
          }
          break;
      }
      return placeholder;
    };
    FileAppender.prototype.removePlaceholder = function(placeholder) {
      switch (this.strategy) {
        case "NONE":
          break;
        case "VALUE":
          break;
        case "ARRAY":
          arrayRemove(this.req.files, placeholder);
          break;
        case "OBJECT":
          if (this.req.files[placeholder.fieldname].length === 1) {
            delete this.req.files[placeholder.fieldname];
          } else {
            arrayRemove(this.req.files[placeholder.fieldname], placeholder);
          }
          break;
      }
    };
    FileAppender.prototype.replacePlaceholder = function(placeholder, file) {
      if (this.strategy === "VALUE") {
        this.req.file = file;
        return;
      }
      delete placeholder.fieldname;
      Object.assign(placeholder, file);
    };
    module2.exports = FileAppender;
  }
});

// ../../../../node_modules/multer/lib/remove-uploaded-files.js
var require_remove_uploaded_files = __commonJS({
  "../../../../node_modules/multer/lib/remove-uploaded-files.js"(exports2, module2) {
    "use strict";
    function removeUploadedFiles(uploadedFiles, remove, cb) {
      var length = uploadedFiles.length;
      var errors = [];
      if (length === 0) return cb(null, errors);
      function handleFile(idx) {
        var file = uploadedFiles[idx];
        remove(file, function(err) {
          if (err) {
            err.file = file;
            err.field = file.fieldname;
            errors.push(err);
          }
          if (idx < length - 1) {
            setImmediate(function() {
              handleFile(idx + 1);
            });
          } else {
            cb(null, errors);
          }
        });
      }
      handleFile(0);
    }
    module2.exports = removeUploadedFiles;
  }
});

// ../../../../node_modules/multer/lib/make-middleware.js
var require_make_middleware = __commonJS({
  "../../../../node_modules/multer/lib/make-middleware.js"(exports2, module2) {
    "use strict";
    var is = require_type_is();
    var Busboy = require_lib();
    var appendField = require_append_field();
    var Counter = require_counter();
    var MulterError = require_multer_error();
    var FileAppender = require_file_appender();
    var removeUploadedFiles = require_remove_uploaded_files();
    function drainStream(stream) {
      stream.on("readable", () => {
        while (stream.read() !== null) {
        }
      });
    }
    function makeMiddleware(setup) {
      return function multerMiddleware(req, res, next) {
        if (!is(req, ["multipart"])) return next();
        var options = setup();
        var limits = options.limits;
        var storage2 = options.storage;
        var fileFilter = options.fileFilter;
        var fileStrategy = options.fileStrategy;
        var preservePath = options.preservePath;
        var defParamCharset = options.defParamCharset;
        req.body = /* @__PURE__ */ Object.create(null);
        var busboy;
        var appender = null;
        var isDone = false;
        var readFinished = false;
        var errorOccured = false;
        var pendingWrites = new Counter();
        var uploadedFiles = [];
        function done(err) {
          var called = false;
          function onFinished() {
            if (called) return;
            called = true;
            next(err);
          }
          if (isDone) return;
          isDone = true;
          if (busboy) {
            req.unpipe(busboy);
            setImmediate(() => {
              busboy.removeAllListeners();
            });
          }
          drainStream(req);
          req.resume();
          if (err && req.readable && !req.destroyed) {
            req.once("end", onFinished);
            req.once("error", onFinished);
            req.once("close", onFinished);
            return;
          }
          next(err);
        }
        function indicateDone() {
          if (readFinished && pendingWrites.isZero() && !errorOccured) done();
        }
        function abortWithError(uploadError, skipPendingWait) {
          if (errorOccured) return;
          errorOccured = true;
          function finishAbort() {
            function remove(file, cb) {
              storage2._removeFile(req, file, cb);
            }
            removeUploadedFiles(uploadedFiles, remove, function(err, storageErrors) {
              if (err) return done(err);
              uploadError.storageErrors = storageErrors;
              done(uploadError);
            });
          }
          if (skipPendingWait) {
            finishAbort();
          } else {
            pendingWrites.onceZero(finishAbort);
          }
        }
        function abortWithCode(code, optionalField) {
          abortWithError(new MulterError(code, optionalField));
        }
        function handleRequestFailure(err) {
          if (isDone) return;
          if (busboy) {
            req.unpipe(busboy);
            busboy.destroy(err);
          }
          abortWithError(err, true);
        }
        req.on("error", function(err) {
          handleRequestFailure(err || new Error("Request error"));
        });
        req.on("aborted", function() {
          handleRequestFailure(new Error("Request aborted"));
        });
        req.on("close", function() {
          if (req.readableEnded) return;
          handleRequestFailure(new Error("Request closed"));
        });
        try {
          busboy = Busboy({
            headers: req.headers,
            limits,
            preservePath,
            defParamCharset
          });
        } catch (err) {
          return next(err);
        }
        appender = new FileAppender(fileStrategy, req);
        busboy.on("field", function(fieldname, value, { nameTruncated, valueTruncated }) {
          if (fieldname == null) return abortWithCode("MISSING_FIELD_NAME");
          if (nameTruncated) return abortWithCode("LIMIT_FIELD_KEY");
          if (valueTruncated) return abortWithCode("LIMIT_FIELD_VALUE", fieldname);
          if (limits && Object.prototype.hasOwnProperty.call(limits, "fieldNameSize")) {
            if (fieldname.length > limits.fieldNameSize) return abortWithCode("LIMIT_FIELD_KEY");
          }
          appendField(req.body, fieldname, value);
        });
        busboy.on("file", function(fieldname, fileStream, { filename, encoding, mimeType }) {
          var pendingWritesIncremented = false;
          fileStream.on("error", function(err) {
            if (pendingWritesIncremented) {
              pendingWrites.decrement();
            }
            abortWithError(err);
          });
          if (fieldname == null) return abortWithCode("MISSING_FIELD_NAME");
          if (!filename) return fileStream.resume();
          if (limits && Object.prototype.hasOwnProperty.call(limits, "fieldNameSize")) {
            if (fieldname.length > limits.fieldNameSize) return abortWithCode("LIMIT_FIELD_KEY");
          }
          var file = {
            fieldname,
            originalname: filename,
            encoding,
            mimetype: mimeType
          };
          var placeholder = appender.insertPlaceholder(file);
          fileFilter(req, file, function(err, includeFile) {
            if (errorOccured) {
              appender.removePlaceholder(placeholder);
              return fileStream.resume();
            }
            if (err) {
              appender.removePlaceholder(placeholder);
              return abortWithError(err);
            }
            if (!includeFile) {
              appender.removePlaceholder(placeholder);
              return fileStream.resume();
            }
            var aborting = false;
            pendingWritesIncremented = true;
            pendingWrites.increment();
            Object.defineProperty(file, "stream", {
              configurable: true,
              enumerable: false,
              value: fileStream
            });
            fileStream.on("limit", function() {
              aborting = true;
              abortWithCode("LIMIT_FILE_SIZE", fieldname);
            });
            storage2._handleFile(req, file, function(err2, info) {
              if (aborting) {
                appender.removePlaceholder(placeholder);
                uploadedFiles.push({ ...file, ...info });
                return pendingWrites.decrement();
              }
              if (err2) {
                appender.removePlaceholder(placeholder);
                pendingWrites.decrement();
                return abortWithError(err2);
              }
              var fileInfo = { ...file, ...info };
              appender.replacePlaceholder(placeholder, fileInfo);
              uploadedFiles.push(fileInfo);
              pendingWrites.decrement();
              indicateDone();
            });
          });
        });
        busboy.on("error", function(err) {
          abortWithError(err);
        });
        busboy.on("partsLimit", function() {
          abortWithCode("LIMIT_PART_COUNT");
        });
        busboy.on("filesLimit", function() {
          abortWithCode("LIMIT_FILE_COUNT");
        });
        busboy.on("fieldsLimit", function() {
          abortWithCode("LIMIT_FIELD_COUNT");
        });
        busboy.on("close", function() {
          readFinished = true;
          indicateDone();
        });
        req.pipe(busboy);
      };
    }
    module2.exports = makeMiddleware;
  }
});

// ../../../../node_modules/multer/storage/disk.js
var require_disk = __commonJS({
  "../../../../node_modules/multer/storage/disk.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var os = require("os");
    var path = require("path");
    var crypto = require("crypto");
    function getFilename(req, file, cb) {
      crypto.randomBytes(16, function(err, raw) {
        cb(err, err ? void 0 : raw.toString("hex"));
      });
    }
    function getDestination(req, file, cb) {
      cb(null, os.tmpdir());
    }
    function DiskStorage(opts) {
      this.getFilename = opts.filename || getFilename;
      if (typeof opts.destination === "string") {
        fs.mkdirSync(opts.destination, { recursive: true });
        this.getDestination = function($0, $1, cb) {
          cb(null, opts.destination);
        };
      } else {
        this.getDestination = opts.destination || getDestination;
      }
    }
    DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
      var that = this;
      that.getDestination(req, file, function(err, destination) {
        if (err) return cb(err);
        that.getFilename(req, file, function(err2, filename) {
          if (err2) return cb(err2);
          var finalPath = path.join(destination, filename);
          var outStream = fs.createWriteStream(finalPath);
          file.stream.pipe(outStream);
          outStream.on("error", cb);
          outStream.on("finish", function() {
            cb(null, {
              destination,
              filename,
              path: finalPath,
              size: outStream.bytesWritten
            });
          });
        });
      });
    };
    DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
      var path2 = file.path;
      delete file.destination;
      delete file.filename;
      delete file.path;
      fs.unlink(path2, cb);
    };
    module2.exports = function(opts) {
      return new DiskStorage(opts);
    };
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/stream.js"(exports2, module2) {
    "use strict";
    module2.exports = require("stream");
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports2, module2) {
    "use strict";
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var _require = require("buffer");
    var Buffer2 = _require.Buffer;
    var _require2 = require("util");
    var inspect = _require2.inspect;
    var custom = inspect && inspect.custom || "inspect";
    function copyBuffer(src, target, offset) {
      Buffer2.prototype.copy.call(src, target, offset);
    }
    module2.exports = /* @__PURE__ */ (function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      _createClass(BufferList, [{
        key: "push",
        value: function push(v) {
          var entry = {
            data: v,
            next: null
          };
          if (this.length > 0) this.tail.next = entry;
          else this.head = entry;
          this.tail = entry;
          ++this.length;
        }
      }, {
        key: "unshift",
        value: function unshift(v) {
          var entry = {
            data: v,
            next: this.head
          };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        }
      }, {
        key: "shift",
        value: function shift() {
          if (this.length === 0) return;
          var ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;
          else this.head = this.head.next;
          --this.length;
          return ret;
        }
      }, {
        key: "clear",
        value: function clear() {
          this.head = this.tail = null;
          this.length = 0;
        }
      }, {
        key: "join",
        value: function join(s) {
          if (this.length === 0) return "";
          var p = this.head;
          var ret = "" + p.data;
          while (p = p.next) ret += s + p.data;
          return ret;
        }
      }, {
        key: "concat",
        value: function concat(n) {
          if (this.length === 0) return Buffer2.alloc(0);
          var ret = Buffer2.allocUnsafe(n >>> 0);
          var p = this.head;
          var i = 0;
          while (p) {
            copyBuffer(p.data, ret, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        }
        // Consumes a specified amount of bytes or characters from the buffered data.
      }, {
        key: "consume",
        value: function consume(n, hasStrings) {
          var ret;
          if (n < this.head.data.length) {
            ret = this.head.data.slice(0, n);
            this.head.data = this.head.data.slice(n);
          } else if (n === this.head.data.length) {
            ret = this.shift();
          } else {
            ret = hasStrings ? this._getString(n) : this._getBuffer(n);
          }
          return ret;
        }
      }, {
        key: "first",
        value: function first() {
          return this.head.data;
        }
        // Consumes a specified amount of characters from the buffered data.
      }, {
        key: "_getString",
        value: function _getString(n) {
          var p = this.head;
          var c12 = 1;
          var ret = p.data;
          n -= ret.length;
          while (p = p.next) {
            var str = p.data;
            var nb = n > str.length ? str.length : n;
            if (nb === str.length) ret += str;
            else ret += str.slice(0, n);
            n -= nb;
            if (n === 0) {
              if (nb === str.length) {
                ++c12;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                this.head = p;
                p.data = str.slice(nb);
              }
              break;
            }
            ++c12;
          }
          this.length -= c12;
          return ret;
        }
        // Consumes a specified amount of bytes from the buffered data.
      }, {
        key: "_getBuffer",
        value: function _getBuffer(n) {
          var ret = Buffer2.allocUnsafe(n);
          var p = this.head;
          var c12 = 1;
          p.data.copy(ret);
          n -= p.data.length;
          while (p = p.next) {
            var buf = p.data;
            var nb = n > buf.length ? buf.length : n;
            buf.copy(ret, ret.length - n, 0, nb);
            n -= nb;
            if (n === 0) {
              if (nb === buf.length) {
                ++c12;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                this.head = p;
                p.data = buf.slice(nb);
              }
              break;
            }
            ++c12;
          }
          this.length -= c12;
          return ret;
        }
        // Make sure the linked list only shows the minimal necessary information.
      }, {
        key: custom,
        value: function value(_, options) {
          return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
            // Only inspect one level.
            depth: 0,
            // It should not recurse.
            customInspect: false
          }));
        }
      }]);
      return BufferList;
    })();
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/destroy.js"(exports2, module2) {
    "use strict";
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err) {
          if (!this._writableState) {
            process.nextTick(emitErrorNT, this, err);
          } else if (!this._writableState.errorEmitted) {
            this._writableState.errorEmitted = true;
            process.nextTick(emitErrorNT, this, err);
          }
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          if (!_this._writableState) {
            process.nextTick(emitErrorAndCloseNT, _this, err2);
          } else if (!_this._writableState.errorEmitted) {
            _this._writableState.errorEmitted = true;
            process.nextTick(emitErrorAndCloseNT, _this, err2);
          } else {
            process.nextTick(emitCloseNT, _this);
          }
        } else if (cb) {
          process.nextTick(emitCloseNT, _this);
          cb(err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      });
      return this;
    }
    function emitErrorAndCloseNT(self2, err) {
      emitErrorNT(self2, err);
      emitCloseNT(self2);
    }
    function emitCloseNT(self2) {
      if (self2._writableState && !self2._writableState.emitClose) return;
      if (self2._readableState && !self2._readableState.emitClose) return;
      self2.emit("close");
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit("error", err);
    }
    function errorOrDestroy(stream, err) {
      var rState = stream._readableState;
      var wState = stream._writableState;
      if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);
      else stream.emit("error", err);
    }
    module2.exports = {
      destroy,
      undestroy,
      errorOrDestroy
    };
  }
});

// ../../../../node_modules/readable-stream/errors.js
var require_errors = __commonJS({
  "../../../../node_modules/readable-stream/errors.js"(exports2, module2) {
    "use strict";
    var codes = {};
    function createErrorType(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      function getMessage(arg1, arg2, arg3) {
        if (typeof message === "string") {
          return message;
        } else {
          return message(arg1, arg2, arg3);
        }
      }
      class NodeError extends Base {
        constructor(arg1, arg2, arg3) {
          super(getMessage(arg1, arg2, arg3));
        }
      }
      NodeError.prototype.name = Base.name;
      NodeError.prototype.code = code;
      codes[code] = NodeError;
    }
    function oneOf(expected, thing) {
      if (Array.isArray(expected)) {
        const len = expected.length;
        expected = expected.map((i) => String(i));
        if (len > 2) {
          return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
        } else if (len === 2) {
          return `one of ${thing} ${expected[0]} or ${expected[1]}`;
        } else {
          return `of ${thing} ${expected[0]}`;
        }
      } else {
        return `of ${thing} ${String(expected)}`;
      }
    }
    function startsWith(str, search, pos) {
      return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    }
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function includes(str, search, start) {
      if (typeof start !== "number") {
        start = 0;
      }
      if (start + search.length > str.length) {
        return false;
      } else {
        return str.indexOf(search, start) !== -1;
      }
    }
    createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
      return 'The value "' + value + '" is invalid for option "' + name + '"';
    }, TypeError);
    createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
      let determiner;
      if (typeof expected === "string" && startsWith(expected, "not ")) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
      } else {
        determiner = "must be";
      }
      let msg;
      if (endsWith(name, " argument")) {
        msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
      } else {
        const type = includes(name, ".") ? "property" : "argument";
        msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
      }
      msg += `. Received type ${typeof actual}`;
      return msg;
    }, TypeError);
    createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
    createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
      return "The " + name + " method is not implemented";
    });
    createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
    createErrorType("ERR_STREAM_DESTROYED", function(name) {
      return "Cannot call " + name + " after a stream was destroyed";
    });
    createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
    createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
    createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
    createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
    createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
      return "Unknown encoding: " + arg;
    }, TypeError);
    createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
    module2.exports.codes = codes;
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/state.js"(exports2, module2) {
    "use strict";
    var ERR_INVALID_OPT_VALUE = require_errors().codes.ERR_INVALID_OPT_VALUE;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
          var name = isDuplex ? duplexKey : "highWaterMark";
          throw new ERR_INVALID_OPT_VALUE(name, hwm);
        }
        return Math.floor(hwm);
      }
      return state.objectMode ? 16 : 16 * 1024;
    }
    module2.exports = {
      getHighWaterMark
    };
  }
});

// ../../../../node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "../../../../node_modules/inherits/inherits_browser.js"(exports2, module2) {
    "use strict";
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// ../../../../node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "../../../../node_modules/inherits/inherits.js"(exports2, module2) {
    "use strict";
    try {
      util = require("util");
      if (typeof util.inherits !== "function") throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// ../../../../node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "../../../../node_modules/util-deprecate/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require("util").deprecate;
  }
});

// ../../../../node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "../../../../node_modules/readable-stream/lib/_stream_writable.js"(exports2, module2) {
    "use strict";
    module2.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var Duplex;
    Writable.WritableState = WritableState;
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream();
    var Buffer2 = require("buffer").Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    var _require = require_state();
    var getHighWaterMark = _require.getHighWaterMark;
    var _require$codes = require_errors().codes;
    var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
    var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
    var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
    var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
    var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
    var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
    var errorOrDestroy = destroyImpl.errorOrDestroy;
    require_inherits()(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream, isDuplex) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
      this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = options.emitClose !== false;
      this.autoDestroy = !!options.autoDestroy;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function writableStateBufferGetter() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function value(object) {
          if (realHasInstance.call(this, object)) return true;
          if (this !== Writable) return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function realHasInstance2(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      var isDuplex = this instanceof Duplex;
      if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function writeAfterEnd(stream, cb) {
      var er = new ERR_STREAM_WRITE_AFTER_END();
      errorOrDestroy(stream, er);
      process.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var er;
      if (chunk === null) {
        er = new ERR_STREAM_NULL_VALUES();
      } else if (typeof chunk !== "string" && !state.objectMode) {
        er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
      }
      if (er) {
        errorOrDestroy(stream, er);
        process.nextTick(cb, er);
        return false;
      }
      return true;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf) encoding = "buffer";
      else if (!encoding) encoding = state.defaultEncoding;
      if (typeof cb !== "function") cb = nop;
      if (state.ending) writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    Object.defineProperty(Writable.prototype, "writableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState && this._writableState.getBuffer();
      }
    });
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        process.nextTick(cb, er);
        process.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        errorOrDestroy(stream, er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        errorOrDestroy(stream, er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
      onwriteStateUpdate(state);
      if (er) onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state) || stream.destroyed;
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          process.nextTick(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished) onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf) allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null) state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending) endWritable(this, state, cb);
      return this;
    };
    Object.defineProperty(Writable.prototype, "writableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.length;
      }
    });
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          errorOrDestroy(stream, err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function" && !state.destroyed) {
          state.pendingcb++;
          state.finalCalled = true;
          process.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
          if (state.autoDestroy) {
            var rState = stream._readableState;
            if (!rState || rState.autoDestroy && rState.endEmitted) {
              stream.destroy();
            }
          }
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished) process.nextTick(cb);
        else stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      state.corkedRequestsFree.next = corkReq;
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function set(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      cb(err);
    };
  }
});

// ../../../../node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "../../../../node_modules/readable-stream/lib/_stream_duplex.js"(exports2, module2) {
    "use strict";
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) keys2.push(key);
      return keys2;
    };
    module2.exports = Duplex;
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    require_inherits()(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      this.allowHalfOpen = true;
      if (options) {
        if (options.readable === false) this.readable = false;
        if (options.writable === false) this.writable = false;
        if (options.allowHalfOpen === false) {
          this.allowHalfOpen = false;
          this.once("end", onend);
        }
      }
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.highWaterMark;
      }
    });
    Object.defineProperty(Duplex.prototype, "writableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState && this._writableState.getBuffer();
      }
    });
    Object.defineProperty(Duplex.prototype, "writableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.length;
      }
    });
    function onend() {
      if (this._writableState.ended) return;
      process.nextTick(onEndNT, this);
    }
    function onEndNT(self2) {
      self2.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function set(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
  }
});

// ../../../../node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "../../../../node_modules/safe-buffer/index.js"(exports2, module2) {
    "use strict";
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// ../../../../node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "../../../../node_modules/string_decoder/lib/string_decoder.js"(exports2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports2.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1;
      if (j < i) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0) return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed) return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c12 = r.charCodeAt(r.length - 1);
          if (c12 >= 55296 && c12 <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0) return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports2, module2) {
    "use strict";
    var ERR_STREAM_PREMATURE_CLOSE = require_errors().codes.ERR_STREAM_PREMATURE_CLOSE;
    function once(callback) {
      var called = false;
      return function() {
        if (called) return;
        called = true;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        callback.apply(this, args);
      };
    }
    function noop2() {
    }
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    function eos(stream, opts, callback) {
      if (typeof opts === "function") return eos(stream, null, opts);
      if (!opts) opts = {};
      callback = once(callback || noop2);
      var readable = opts.readable || opts.readable !== false && stream.readable;
      var writable = opts.writable || opts.writable !== false && stream.writable;
      var onlegacyfinish = function onlegacyfinish2() {
        if (!stream.writable) onfinish();
      };
      var writableEnded = stream._writableState && stream._writableState.finished;
      var onfinish = function onfinish2() {
        writable = false;
        writableEnded = true;
        if (!readable) callback.call(stream);
      };
      var readableEnded = stream._readableState && stream._readableState.endEmitted;
      var onend = function onend2() {
        readable = false;
        readableEnded = true;
        if (!writable) callback.call(stream);
      };
      var onerror = function onerror2(err) {
        callback.call(stream, err);
      };
      var onclose = function onclose2() {
        var err;
        if (readable && !readableEnded) {
          if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
          return callback.call(stream, err);
        }
        if (writable && !writableEnded) {
          if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
          return callback.call(stream, err);
        }
      };
      var onrequest = function onrequest2() {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req) onrequest();
        else stream.on("request", onrequest);
      } else if (writable && !stream._writableState) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (opts.error !== false) stream.on("error", onerror);
      stream.on("close", onclose);
      return function() {
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
    }
    module2.exports = eos;
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/async_iterator.js
var require_async_iterator = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/async_iterator.js"(exports2, module2) {
    "use strict";
    var _Object$setPrototypeO;
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var finished = require_end_of_stream();
    var kLastResolve = /* @__PURE__ */ Symbol("lastResolve");
    var kLastReject = /* @__PURE__ */ Symbol("lastReject");
    var kError = /* @__PURE__ */ Symbol("error");
    var kEnded = /* @__PURE__ */ Symbol("ended");
    var kLastPromise = /* @__PURE__ */ Symbol("lastPromise");
    var kHandlePromise = /* @__PURE__ */ Symbol("handlePromise");
    var kStream = /* @__PURE__ */ Symbol("stream");
    function createIterResult(value, done) {
      return {
        value,
        done
      };
    }
    function readAndResolve(iter) {
      var resolve = iter[kLastResolve];
      if (resolve !== null) {
        var data = iter[kStream].read();
        if (data !== null) {
          iter[kLastPromise] = null;
          iter[kLastResolve] = null;
          iter[kLastReject] = null;
          resolve(createIterResult(data, false));
        }
      }
    }
    function onReadable(iter) {
      process.nextTick(readAndResolve, iter);
    }
    function wrapForNext(lastPromise, iter) {
      return function(resolve, reject) {
        lastPromise.then(function() {
          if (iter[kEnded]) {
            resolve(createIterResult(void 0, true));
            return;
          }
          iter[kHandlePromise](resolve, reject);
        }, reject);
      };
    }
    var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
    });
    var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
      get stream() {
        return this[kStream];
      },
      next: function next() {
        var _this = this;
        var error = this[kError];
        if (error !== null) {
          return Promise.reject(error);
        }
        if (this[kEnded]) {
          return Promise.resolve(createIterResult(void 0, true));
        }
        if (this[kStream].destroyed) {
          return new Promise(function(resolve, reject) {
            process.nextTick(function() {
              if (_this[kError]) {
                reject(_this[kError]);
              } else {
                resolve(createIterResult(void 0, true));
              }
            });
          });
        }
        var lastPromise = this[kLastPromise];
        var promise;
        if (lastPromise) {
          promise = new Promise(wrapForNext(lastPromise, this));
        } else {
          var data = this[kStream].read();
          if (data !== null) {
            return Promise.resolve(createIterResult(data, false));
          }
          promise = new Promise(this[kHandlePromise]);
        }
        this[kLastPromise] = promise;
        return promise;
      }
    }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
      return this;
    }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
      var _this2 = this;
      return new Promise(function(resolve, reject) {
        _this2[kStream].destroy(null, function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(createIterResult(void 0, true));
        });
      });
    }), _Object$setPrototypeO), AsyncIteratorPrototype);
    var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
      var _Object$create;
      var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
        value: stream,
        writable: true
      }), _defineProperty(_Object$create, kLastResolve, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kLastReject, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kError, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kEnded, {
        value: stream._readableState.endEmitted,
        writable: true
      }), _defineProperty(_Object$create, kHandlePromise, {
        value: function value(resolve, reject) {
          var data = iterator[kStream].read();
          if (data) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            resolve(createIterResult(data, false));
          } else {
            iterator[kLastResolve] = resolve;
            iterator[kLastReject] = reject;
          }
        },
        writable: true
      }), _Object$create));
      iterator[kLastPromise] = null;
      finished(stream, function(err) {
        if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
          var reject = iterator[kLastReject];
          if (reject !== null) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            reject(err);
          }
          iterator[kError] = err;
          return;
        }
        var resolve = iterator[kLastResolve];
        if (resolve !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(void 0, true));
        }
        iterator[kEnded] = true;
      });
      stream.on("readable", onReadable.bind(null, iterator));
      return iterator;
    };
    module2.exports = createReadableStreamAsyncIterator;
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/from.js"(exports2, module2) {
    "use strict";
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self2 = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self2, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var ERR_INVALID_ARG_TYPE = require_errors().codes.ERR_INVALID_ARG_TYPE;
    function from(Readable, iterable, opts) {
      var iterator;
      if (iterable && typeof iterable.next === "function") {
        iterator = iterable;
      } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();
      else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();
      else throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
      var readable = new Readable(_objectSpread({
        objectMode: true
      }, opts));
      var reading = false;
      readable._read = function() {
        if (!reading) {
          reading = true;
          next();
        }
      };
      function next() {
        return _next2.apply(this, arguments);
      }
      function _next2() {
        _next2 = _asyncToGenerator(function* () {
          try {
            var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
            if (done) {
              readable.push(null);
            } else if (readable.push(yield value)) {
              next();
            } else {
              reading = false;
            }
          } catch (err) {
            readable.destroy(err);
          }
        });
        return _next2.apply(this, arguments);
      }
      return readable;
    }
    module2.exports = from;
  }
});

// ../../../../node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "../../../../node_modules/readable-stream/lib/_stream_readable.js"(exports2, module2) {
    "use strict";
    module2.exports = Readable;
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = require("events").EventEmitter;
    var EElistenerCount = function EElistenerCount2(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream();
    var Buffer2 = require("buffer").Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var debugUtil = require("util");
    var debug;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function debug2() {
      };
    }
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
    var _require = require_state();
    var getHighWaterMark = _require.getHighWaterMark;
    var _require$codes = require_errors().codes;
    var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
    var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
    var StringDecoder;
    var createReadableStreamAsyncIterator;
    var from;
    require_inherits()(Readable, Stream);
    var errorOrDestroy = destroyImpl.errorOrDestroy;
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream, isDuplex) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
      this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.paused = true;
      this.emitClose = options.emitClose !== false;
      this.autoDestroy = !!options.autoDestroy;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable)) return new Readable(options);
      var isDuplex = this instanceof Duplex;
      this._readableState = new ReadableState(options, this, isDuplex);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function set(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      debug("readableAddChunk", chunk);
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck) er = chunkInvalid(state, chunk);
        if (er) {
          errorOrDestroy(stream, er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
            else addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
          } else if (state.destroyed) {
            return false;
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
              else maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
          maybeReadMore(stream, state);
        }
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        state.awaitDrain = 0;
        stream.emit("data", chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      }
      return er;
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
      var decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      var p = this._readableState.buffer.head;
      var content = "";
      while (p !== null) {
        content += decoder.write(p.data);
        p = p.next;
      }
      this._readableState.buffer.clear();
      if (content !== "") this._readableState.buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended) return 0;
      if (state.objectMode) return 1;
      if (n !== n) {
        if (state.flowing && state.length) return state.buffer.head.data.length;
        else return state.length;
      }
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length) return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0) state.emittedReadable = false;
      if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n = 0;
      } else {
        state.length -= n;
        state.awaitDrain = 0;
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null) this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      debug("onEofChunk");
      if (state.ended) return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        if (!state.emittedReadable) {
          state.emittedReadable = true;
          emitReadable_(stream);
        }
      }
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      debug("emitReadable", state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        process.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      var state = stream._readableState;
      debug("emitReadable_", state.destroyed, state.length, state.ended);
      if (!state.destroyed && (state.length || state.ended)) {
        stream.emit("readable");
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        process.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
        var len = state.length;
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        var ret = dest.write(chunk);
        debug("dest.write", ret);
        if (ret === false) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", state.awaitDrain);
            state.awaitDrain++;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0) errorOrDestroy(dest, er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function pipeOnDrainFunctionResult() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain) state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = {
        hasUnpiped: false
      };
      if (state.pipesCount === 0) return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes) return this;
        if (!dest) dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest) dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1) state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      var state = this._readableState;
      if (ev === "data") {
        state.readableListening = this.listenerCount("readable") > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === "readable") {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug("on readable", state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function(ev, fn) {
      var res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === "readable") {
        process.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable.prototype.removeAllListeners = function(ev) {
      var res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === "readable" || ev === void 0) {
        process.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self2) {
      var state = self2._readableState;
      state.readableListening = self2.listenerCount("readable") > 0;
      if (state.resumeScheduled && !state.paused) {
        state.flowing = true;
      } else if (self2.listenerCount("data") > 0) {
        self2.resume();
      }
    }
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state.paused = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug("resume", state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      this._readableState.paused = true;
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) ;
    }
    Readable.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder) chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0)) return;
        else if (!state.objectMode && (!chunk || !chunk.length)) return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = /* @__PURE__ */ (function methodWrap(method) {
            return function methodWrapReturnFunction() {
              return stream[method].apply(stream, arguments);
            };
          })(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    if (typeof Symbol === "function") {
      Readable.prototype[Symbol.asyncIterator] = function() {
        if (createReadableStreamAsyncIterator === void 0) {
          createReadableStreamAsyncIterator = require_async_iterator();
        }
        return createReadableStreamAsyncIterator(this);
      };
    }
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.highWaterMark;
      }
    });
    Object.defineProperty(Readable.prototype, "readableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState && this._readableState.buffer;
      }
    });
    Object.defineProperty(Readable.prototype, "readableFlowing", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.flowing;
      },
      set: function set(state) {
        if (this._readableState) {
          this._readableState.flowing = state;
        }
      }
    });
    Readable._fromList = fromList;
    Object.defineProperty(Readable.prototype, "readableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.length;
      }
    });
    function fromList(n, state) {
      if (state.length === 0) return null;
      var ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      debug("endReadable", state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug("endReadableNT", state.endEmitted, state.length);
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
        if (state.autoDestroy) {
          var wState = stream._writableState;
          if (!wState || wState.autoDestroy && wState.finished) {
            stream.destroy();
          }
        }
      }
    }
    if (typeof Symbol === "function") {
      Readable.from = function(iterable, opts) {
        if (from === void 0) {
          from = require_from();
        }
        return from(Readable, iterable, opts);
      };
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i;
      }
      return -1;
    }
  }
});

// ../../../../node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "../../../../node_modules/readable-stream/lib/_stream_transform.js"(exports2, module2) {
    "use strict";
    module2.exports = Transform;
    var _require$codes = require_errors().codes;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
    var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
    var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
    var Duplex = require_stream_duplex();
    require_inherits()(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (cb === null) {
        return this.emit("error", new ERR_MULTIPLE_CALLBACK());
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function" && !this._readableState.destroyed) {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
      });
    };
    function done(stream, er, data) {
      if (er) return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
      if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
      return stream.push(null);
    }
  }
});

// ../../../../node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "../../../../node_modules/readable-stream/lib/_stream_passthrough.js"(exports2, module2) {
    "use strict";
    module2.exports = PassThrough;
    var Transform = require_stream_transform();
    require_inherits()(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// ../../../../node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  "../../../../node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports2, module2) {
    "use strict";
    var eos;
    function once(callback) {
      var called = false;
      return function() {
        if (called) return;
        called = true;
        callback.apply(void 0, arguments);
      };
    }
    var _require$codes = require_errors().codes;
    var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
    var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
    function noop2(err) {
      if (err) throw err;
    }
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    function destroyer(stream, reading, writing, callback) {
      callback = once(callback);
      var closed = false;
      stream.on("close", function() {
        closed = true;
      });
      if (eos === void 0) eos = require_end_of_stream();
      eos(stream, {
        readable: reading,
        writable: writing
      }, function(err) {
        if (err) return callback(err);
        closed = true;
        callback();
      });
      var destroyed = false;
      return function(err) {
        if (closed) return;
        if (destroyed) return;
        destroyed = true;
        if (isRequest(stream)) return stream.abort();
        if (typeof stream.destroy === "function") return stream.destroy();
        callback(err || new ERR_STREAM_DESTROYED("pipe"));
      };
    }
    function call(fn) {
      fn();
    }
    function pipe(from, to) {
      return from.pipe(to);
    }
    function popCallback(streams) {
      if (!streams.length) return noop2;
      if (typeof streams[streams.length - 1] !== "function") return noop2;
      return streams.pop();
    }
    function pipeline() {
      for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
        streams[_key] = arguments[_key];
      }
      var callback = popCallback(streams);
      if (Array.isArray(streams[0])) streams = streams[0];
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS("streams");
      }
      var error;
      var destroys = streams.map(function(stream, i) {
        var reading = i < streams.length - 1;
        var writing = i > 0;
        return destroyer(stream, reading, writing, function(err) {
          if (!error) error = err;
          if (err) destroys.forEach(call);
          if (reading) return;
          destroys.forEach(call);
          callback(error);
        });
      });
      return streams.reduce(pipe);
    }
    module2.exports = pipeline;
  }
});

// ../../../../node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "../../../../node_modules/readable-stream/readable.js"(exports2, module2) {
    "use strict";
    var Stream = require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream.Readable;
      Object.assign(module2.exports, Stream);
      module2.exports.Stream = Stream;
    } else {
      exports2 = module2.exports = require_stream_readable();
      exports2.Stream = Stream || exports2;
      exports2.Readable = exports2;
      exports2.Writable = require_stream_writable();
      exports2.Duplex = require_stream_duplex();
      exports2.Transform = require_stream_transform();
      exports2.PassThrough = require_stream_passthrough();
      exports2.finished = require_end_of_stream();
      exports2.pipeline = require_pipeline();
    }
  }
});

// ../../../../node_modules/buffer-from/index.js
var require_buffer_from = __commonJS({
  "../../../../node_modules/buffer-from/index.js"(exports2, module2) {
    "use strict";
    var toString = Object.prototype.toString;
    var isModern = typeof Buffer !== "undefined" && typeof Buffer.alloc === "function" && typeof Buffer.allocUnsafe === "function" && typeof Buffer.from === "function";
    function isArrayBuffer(input) {
      return toString.call(input).slice(8, -1) === "ArrayBuffer";
    }
    function fromArrayBuffer(obj, byteOffset, length) {
      byteOffset >>>= 0;
      var maxLength = obj.byteLength - byteOffset;
      if (maxLength < 0) {
        throw new RangeError("'offset' is out of bounds");
      }
      if (length === void 0) {
        length = maxLength;
      } else {
        length >>>= 0;
        if (length > maxLength) {
          throw new RangeError("'length' is out of bounds");
        }
      }
      return isModern ? Buffer.from(obj.slice(byteOffset, byteOffset + length)) : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)));
    }
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
      }
      return isModern ? Buffer.from(string, encoding) : new Buffer(string, encoding);
    }
    function bufferFrom(value, encodingOrOffset, length) {
      if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
      }
      if (isArrayBuffer(value)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      return isModern ? Buffer.from(value) : new Buffer(value);
    }
    module2.exports = bufferFrom;
  }
});

// ../../../../node_modules/typedarray/index.js
var require_typedarray = __commonJS({
  "../../../../node_modules/typedarray/index.js"(exports2) {
    "use strict";
    var undefined2 = void 0;
    var MAX_ARRAY_LENGTH = 1e5;
    var ECMAScript = /* @__PURE__ */ (function() {
      var opts = Object.prototype.toString, ophop = Object.prototype.hasOwnProperty;
      return {
        // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
        Class: function(v) {
          return opts.call(v).replace(/^\[object *|\]$/g, "");
        },
        HasProperty: function(o, p) {
          return p in o;
        },
        HasOwnProperty: function(o, p) {
          return ophop.call(o, p);
        },
        IsCallable: function(o) {
          return typeof o === "function";
        },
        ToInt32: function(v) {
          return v >> 0;
        },
        ToUint32: function(v) {
          return v >>> 0;
        }
      };
    })();
    var LN2 = Math.LN2;
    var abs = Math.abs;
    var floor = Math.floor;
    var log = Math.log;
    var min = Math.min;
    var pow = Math.pow;
    var round = Math.round;
    function configureProperties(obj) {
      if (getOwnPropNames && defineProp) {
        var props = getOwnPropNames(obj), i;
        for (i = 0; i < props.length; i += 1) {
          defineProp(obj, props[i], {
            value: obj[props[i]],
            writable: false,
            enumerable: false,
            configurable: false
          });
        }
      }
    }
    var defineProp;
    if (Object.defineProperty && (function() {
      try {
        Object.defineProperty({}, "x", {});
        return true;
      } catch (e) {
        return false;
      }
    })()) {
      defineProp = Object.defineProperty;
    } else {
      defineProp = function(o, p, desc) {
        if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
        if (ECMAScript.HasProperty(desc, "get") && Object.prototype.__defineGetter__) {
          Object.prototype.__defineGetter__.call(o, p, desc.get);
        }
        if (ECMAScript.HasProperty(desc, "set") && Object.prototype.__defineSetter__) {
          Object.prototype.__defineSetter__.call(o, p, desc.set);
        }
        if (ECMAScript.HasProperty(desc, "value")) {
          o[p] = desc.value;
        }
        return o;
      };
    }
    var getOwnPropNames = Object.getOwnPropertyNames || function(o) {
      if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
      var props = [], p;
      for (p in o) {
        if (ECMAScript.HasOwnProperty(o, p)) {
          props.push(p);
        }
      }
      return props;
    };
    function makeArrayAccessors(obj) {
      if (!defineProp) {
        return;
      }
      if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError("Array too large for polyfill");
      function makeArrayAccessor(index) {
        defineProp(obj, index, {
          "get": function() {
            return obj._getter(index);
          },
          "set": function(v) {
            obj._setter(index, v);
          },
          enumerable: true,
          configurable: false
        });
      }
      var i;
      for (i = 0; i < obj.length; i += 1) {
        makeArrayAccessor(i);
      }
    }
    function as_signed(value, bits) {
      var s = 32 - bits;
      return value << s >> s;
    }
    function as_unsigned(value, bits) {
      var s = 32 - bits;
      return value << s >>> s;
    }
    function packI8(n) {
      return [n & 255];
    }
    function unpackI8(bytes) {
      return as_signed(bytes[0], 8);
    }
    function packU8(n) {
      return [n & 255];
    }
    function unpackU8(bytes) {
      return as_unsigned(bytes[0], 8);
    }
    function packU8Clamped(n) {
      n = round(Number(n));
      return [n < 0 ? 0 : n > 255 ? 255 : n & 255];
    }
    function packI16(n) {
      return [n >> 8 & 255, n & 255];
    }
    function unpackI16(bytes) {
      return as_signed(bytes[0] << 8 | bytes[1], 16);
    }
    function packU16(n) {
      return [n >> 8 & 255, n & 255];
    }
    function unpackU16(bytes) {
      return as_unsigned(bytes[0] << 8 | bytes[1], 16);
    }
    function packI32(n) {
      return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    function unpackI32(bytes) {
      return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packU32(n) {
      return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    function unpackU32(bytes) {
      return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << ebits - 1) - 1, s, e, f, ln, i, bits, str, bytes;
      function roundToEven(n) {
        var w = floor(n), f2 = n - w;
        if (f2 < 0.5)
          return w;
        if (f2 > 0.5)
          return w + 1;
        return w % 2 ? w + 1 : w;
      }
      if (v !== v) {
        e = (1 << ebits) - 1;
        f = pow(2, fbits - 1);
        s = 0;
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1;
        f = 0;
        s = v < 0 ? 1 : 0;
      } else if (v === 0) {
        e = 0;
        f = 0;
        s = 1 / v === -Infinity ? 1 : 0;
      } else {
        s = v < 0;
        v = abs(v);
        if (v >= pow(2, 1 - bias)) {
          e = min(floor(log(v) / LN2), 1023);
          f = roundToEven(v / pow(2, e) * pow(2, fbits));
          if (f / pow(2, fbits) >= 2) {
            e = e + 1;
            f = 1;
          }
          if (e > bias) {
            e = (1 << ebits) - 1;
            f = 0;
          } else {
            e = e + bias;
            f = f - pow(2, fbits);
          }
        } else {
          e = 0;
          f = roundToEven(v / pow(2, 1 - bias - fbits));
        }
      }
      bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = floor(e / 2);
      }
      bits.push(s ? 1 : 0);
      bits.reverse();
      str = bits.join("");
      bytes = [];
      while (str.length) {
        bytes.push(parseInt(str.substring(0, 8), 2));
        str = str.substring(8);
      }
      return bytes;
    }
    function unpackIEEE754(bytes, ebits, fbits) {
      var bits = [], i, j, b, str, bias, s, e, f;
      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1];
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0);
          b = b >> 1;
        }
      }
      bits.reverse();
      str = bits.join("");
      bias = (1 << ebits - 1) - 1;
      s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
      e = parseInt(str.substring(1, 1 + ebits), 2);
      f = parseInt(str.substring(1 + ebits), 2);
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
      } else if (e > 0) {
        return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
      } else if (f !== 0) {
        return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
      } else {
        return s < 0 ? -0 : 0;
      }
    }
    function unpackF64(b) {
      return unpackIEEE754(b, 11, 52);
    }
    function packF64(v) {
      return packIEEE754(v, 11, 52);
    }
    function unpackF32(b) {
      return unpackIEEE754(b, 8, 23);
    }
    function packF32(v) {
      return packIEEE754(v, 8, 23);
    }
    (function() {
      var ArrayBuffer = function ArrayBuffer2(length) {
        length = ECMAScript.ToInt32(length);
        if (length < 0) throw new RangeError("ArrayBuffer size is not a small enough positive integer");
        this.byteLength = length;
        this._bytes = [];
        this._bytes.length = length;
        var i;
        for (i = 0; i < this.byteLength; i += 1) {
          this._bytes[i] = 0;
        }
        configureProperties(this);
      };
      exports2.ArrayBuffer = exports2.ArrayBuffer || ArrayBuffer;
      var ArrayBufferView = function ArrayBufferView2() {
      };
      function makeConstructor(bytesPerElement, pack, unpack) {
        var ctor;
        ctor = function(buffer, byteOffset, length) {
          var array, sequence, i, s;
          if (!arguments.length || typeof arguments[0] === "number") {
            this.length = ECMAScript.ToInt32(arguments[0]);
            if (length < 0) throw new RangeError("ArrayBufferView size is not a small enough positive integer");
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
          } else if (typeof arguments[0] === "object" && arguments[0].constructor === ctor) {
            array = arguments[0];
            this.length = array.length;
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
            for (i = 0; i < this.length; i += 1) {
              this._setter(i, array._getter(i));
            }
          } else if (typeof arguments[0] === "object" && !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
            sequence = arguments[0];
            this.length = ECMAScript.ToUint32(sequence.length);
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
            for (i = 0; i < this.length; i += 1) {
              s = sequence[i];
              this._setter(i, Number(s));
            }
          } else if (typeof arguments[0] === "object" && (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
            this.buffer = buffer;
            this.byteOffset = ECMAScript.ToUint32(byteOffset);
            if (this.byteOffset > this.buffer.byteLength) {
              throw new RangeError("byteOffset out of range");
            }
            if (this.byteOffset % this.BYTES_PER_ELEMENT) {
              throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
            }
            if (arguments.length < 3) {
              this.byteLength = this.buffer.byteLength - this.byteOffset;
              if (this.byteLength % this.BYTES_PER_ELEMENT) {
                throw new RangeError("length of buffer minus byteOffset not a multiple of the element size");
              }
              this.length = this.byteLength / this.BYTES_PER_ELEMENT;
            } else {
              this.length = ECMAScript.ToUint32(length);
              this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            }
            if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
              throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
            }
          } else {
            throw new TypeError("Unexpected argument type(s)");
          }
          this.constructor = ctor;
          configureProperties(this);
          makeArrayAccessors(this);
        };
        ctor.prototype = new ArrayBufferView();
        ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
        ctor.prototype._pack = pack;
        ctor.prototype._unpack = unpack;
        ctor.BYTES_PER_ELEMENT = bytesPerElement;
        ctor.prototype._getter = function(index) {
          if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
          index = ECMAScript.ToUint32(index);
          if (index >= this.length) {
            return undefined2;
          }
          var bytes = [], i, o;
          for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
            bytes.push(this.buffer._bytes[o]);
          }
          return this._unpack(bytes);
        };
        ctor.prototype.get = ctor.prototype._getter;
        ctor.prototype._setter = function(index, value) {
          if (arguments.length < 2) throw new SyntaxError("Not enough arguments");
          index = ECMAScript.ToUint32(index);
          if (index >= this.length) {
            return undefined2;
          }
          var bytes = this._pack(value), i, o;
          for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
            this.buffer._bytes[o] = bytes[i];
          }
        };
        ctor.prototype.set = function(index, value) {
          if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
          var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp;
          if (typeof arguments[0] === "object" && arguments[0].constructor === this.constructor) {
            array = arguments[0];
            offset = ECMAScript.ToUint32(arguments[1]);
            if (offset + array.length > this.length) {
              throw new RangeError("Offset plus length of array is out of range");
            }
            byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
            byteLength = array.length * this.BYTES_PER_ELEMENT;
            if (array.buffer === this.buffer) {
              tmp = [];
              for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
                tmp[i] = array.buffer._bytes[s];
              }
              for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
                this.buffer._bytes[d] = tmp[i];
              }
            } else {
              for (i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, s += 1, d += 1) {
                this.buffer._bytes[d] = array.buffer._bytes[s];
              }
            }
          } else if (typeof arguments[0] === "object" && typeof arguments[0].length !== "undefined") {
            sequence = arguments[0];
            len = ECMAScript.ToUint32(sequence.length);
            offset = ECMAScript.ToUint32(arguments[1]);
            if (offset + len > this.length) {
              throw new RangeError("Offset plus length of array is out of range");
            }
            for (i = 0; i < len; i += 1) {
              s = sequence[i];
              this._setter(offset + i, Number(s));
            }
          } else {
            throw new TypeError("Unexpected argument type(s)");
          }
        };
        ctor.prototype.subarray = function(start, end) {
          function clamp(v, min2, max) {
            return v < min2 ? min2 : v > max ? max : v;
          }
          start = ECMAScript.ToInt32(start);
          end = ECMAScript.ToInt32(end);
          if (arguments.length < 1) {
            start = 0;
          }
          if (arguments.length < 2) {
            end = this.length;
          }
          if (start < 0) {
            start = this.length + start;
          }
          if (end < 0) {
            end = this.length + end;
          }
          start = clamp(start, 0, this.length);
          end = clamp(end, 0, this.length);
          var len = end - start;
          if (len < 0) {
            len = 0;
          }
          return new this.constructor(
            this.buffer,
            this.byteOffset + start * this.BYTES_PER_ELEMENT,
            len
          );
        };
        return ctor;
      }
      var Int8Array = makeConstructor(1, packI8, unpackI8);
      var Uint8Array2 = makeConstructor(1, packU8, unpackU8);
      var Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8);
      var Int16Array = makeConstructor(2, packI16, unpackI16);
      var Uint16Array = makeConstructor(2, packU16, unpackU16);
      var Int32Array = makeConstructor(4, packI32, unpackI32);
      var Uint32Array = makeConstructor(4, packU32, unpackU32);
      var Float32Array = makeConstructor(4, packF32, unpackF32);
      var Float64Array = makeConstructor(8, packF64, unpackF64);
      exports2.Int8Array = exports2.Int8Array || Int8Array;
      exports2.Uint8Array = exports2.Uint8Array || Uint8Array2;
      exports2.Uint8ClampedArray = exports2.Uint8ClampedArray || Uint8ClampedArray;
      exports2.Int16Array = exports2.Int16Array || Int16Array;
      exports2.Uint16Array = exports2.Uint16Array || Uint16Array;
      exports2.Int32Array = exports2.Int32Array || Int32Array;
      exports2.Uint32Array = exports2.Uint32Array || Uint32Array;
      exports2.Float32Array = exports2.Float32Array || Float32Array;
      exports2.Float64Array = exports2.Float64Array || Float64Array;
    })();
    (function() {
      function r(array, index) {
        return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
      }
      var IS_BIG_ENDIAN = (function() {
        var u16array = new exports2.Uint16Array([4660]), u8array = new exports2.Uint8Array(u16array.buffer);
        return r(u8array, 0) === 18;
      })();
      var DataView = function DataView2(buffer, byteOffset, byteLength) {
        if (arguments.length === 0) {
          buffer = new exports2.ArrayBuffer(0);
        } else if (!(buffer instanceof exports2.ArrayBuffer || ECMAScript.Class(buffer) === "ArrayBuffer")) {
          throw new TypeError("TypeError");
        }
        this.buffer = buffer || new exports2.ArrayBuffer(0);
        this.byteOffset = ECMAScript.ToUint32(byteOffset);
        if (this.byteOffset > this.buffer.byteLength) {
          throw new RangeError("byteOffset out of range");
        }
        if (arguments.length < 3) {
          this.byteLength = this.buffer.byteLength - this.byteOffset;
        } else {
          this.byteLength = ECMAScript.ToUint32(byteLength);
        }
        if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
          throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
        }
        configureProperties(this);
      };
      function makeGetter(arrayType) {
        return function(byteOffset, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset);
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError("Array index out of range");
          }
          byteOffset += this.byteOffset;
          var uint8Array = new exports2.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT), bytes = [], i;
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(uint8Array, i));
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse();
          }
          return r(new arrayType(new exports2.Uint8Array(bytes).buffer), 0);
        };
      }
      DataView.prototype.getUint8 = makeGetter(exports2.Uint8Array);
      DataView.prototype.getInt8 = makeGetter(exports2.Int8Array);
      DataView.prototype.getUint16 = makeGetter(exports2.Uint16Array);
      DataView.prototype.getInt16 = makeGetter(exports2.Int16Array);
      DataView.prototype.getUint32 = makeGetter(exports2.Uint32Array);
      DataView.prototype.getInt32 = makeGetter(exports2.Int32Array);
      DataView.prototype.getFloat32 = makeGetter(exports2.Float32Array);
      DataView.prototype.getFloat64 = makeGetter(exports2.Float64Array);
      function makeSetter(arrayType) {
        return function(byteOffset, value, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset);
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError("Array index out of range");
          }
          var typeArray = new arrayType([value]), byteArray = new exports2.Uint8Array(typeArray.buffer), bytes = [], i, byteView;
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(byteArray, i));
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse();
          }
          byteView = new exports2.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
          byteView.set(bytes);
        };
      }
      DataView.prototype.setUint8 = makeSetter(exports2.Uint8Array);
      DataView.prototype.setInt8 = makeSetter(exports2.Int8Array);
      DataView.prototype.setUint16 = makeSetter(exports2.Uint16Array);
      DataView.prototype.setInt16 = makeSetter(exports2.Int16Array);
      DataView.prototype.setUint32 = makeSetter(exports2.Uint32Array);
      DataView.prototype.setInt32 = makeSetter(exports2.Int32Array);
      DataView.prototype.setFloat32 = makeSetter(exports2.Float32Array);
      DataView.prototype.setFloat64 = makeSetter(exports2.Float64Array);
      exports2.DataView = exports2.DataView || DataView;
    })();
  }
});

// ../../../../node_modules/concat-stream/index.js
var require_concat_stream = __commonJS({
  "../../../../node_modules/concat-stream/index.js"(exports2, module2) {
    "use strict";
    var Writable = require_readable().Writable;
    var inherits = require_inherits();
    var bufferFrom = require_buffer_from();
    if (typeof Uint8Array === "undefined") {
      U8 = require_typedarray().Uint8Array;
    } else {
      U8 = Uint8Array;
    }
    var U8;
    function ConcatStream(opts, cb) {
      if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb);
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      if (!opts) opts = {};
      var encoding = opts.encoding;
      var shouldInferEncoding = false;
      if (!encoding) {
        shouldInferEncoding = true;
      } else {
        encoding = String(encoding).toLowerCase();
        if (encoding === "u8" || encoding === "uint8") {
          encoding = "uint8array";
        }
      }
      Writable.call(this, { objectMode: true });
      this.encoding = encoding;
      this.shouldInferEncoding = shouldInferEncoding;
      if (cb) this.on("finish", function() {
        cb(this.getBody());
      });
      this.body = [];
    }
    module2.exports = ConcatStream;
    inherits(ConcatStream, Writable);
    ConcatStream.prototype._write = function(chunk, enc, next) {
      this.body.push(chunk);
      next();
    };
    ConcatStream.prototype.inferEncoding = function(buff) {
      var firstBuffer = buff === void 0 ? this.body[0] : buff;
      if (Buffer.isBuffer(firstBuffer)) return "buffer";
      if (typeof Uint8Array !== "undefined" && firstBuffer instanceof Uint8Array) return "uint8array";
      if (Array.isArray(firstBuffer)) return "array";
      if (typeof firstBuffer === "string") return "string";
      if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return "object";
      return "buffer";
    };
    ConcatStream.prototype.getBody = function() {
      if (!this.encoding && this.body.length === 0) return [];
      if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
      if (this.encoding === "array") return arrayConcat(this.body);
      if (this.encoding === "string") return stringConcat(this.body);
      if (this.encoding === "buffer") return bufferConcat(this.body);
      if (this.encoding === "uint8array") return u8Concat(this.body);
      return this.body;
    };
    function isArrayish(arr) {
      return /Array\]$/.test(Object.prototype.toString.call(arr));
    }
    function isBufferish(p) {
      return typeof p === "string" || isArrayish(p) || p && typeof p.subarray === "function";
    }
    function stringConcat(parts) {
      var strings = [];
      var needsToString = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (typeof p === "string") {
          strings.push(p);
        } else if (Buffer.isBuffer(p)) {
          strings.push(p);
        } else if (isBufferish(p)) {
          strings.push(bufferFrom(p));
        } else {
          strings.push(bufferFrom(String(p)));
        }
      }
      if (Buffer.isBuffer(parts[0])) {
        strings = Buffer.concat(strings);
        strings = strings.toString("utf8");
      } else {
        strings = strings.join("");
      }
      return strings;
    }
    function bufferConcat(parts) {
      var bufs = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (Buffer.isBuffer(p)) {
          bufs.push(p);
        } else if (isBufferish(p)) {
          bufs.push(bufferFrom(p));
        } else {
          bufs.push(bufferFrom(String(p)));
        }
      }
      return Buffer.concat(bufs);
    }
    function arrayConcat(parts) {
      var res = [];
      for (var i = 0; i < parts.length; i++) {
        res.push.apply(res, parts[i]);
      }
      return res;
    }
    function u8Concat(parts) {
      var len = 0;
      for (var i = 0; i < parts.length; i++) {
        if (typeof parts[i] === "string") {
          parts[i] = bufferFrom(parts[i]);
        }
        len += parts[i].length;
      }
      var u8 = new U8(len);
      for (var i = 0, offset = 0; i < parts.length; i++) {
        var part = parts[i];
        for (var j = 0; j < part.length; j++) {
          u8[offset++] = part[j];
        }
      }
      return u8;
    }
  }
});

// ../../../../node_modules/multer/storage/memory.js
var require_memory = __commonJS({
  "../../../../node_modules/multer/storage/memory.js"(exports2, module2) {
    "use strict";
    var concat = require_concat_stream();
    function MemoryStorage(opts) {
    }
    MemoryStorage.prototype._handleFile = function _handleFile(req, file, cb) {
      file.stream.pipe(concat({ encoding: "buffer" }, function(data) {
        cb(null, {
          buffer: data,
          size: data.length
        });
      }));
    };
    MemoryStorage.prototype._removeFile = function _removeFile(req, file, cb) {
      delete file.buffer;
      cb(null);
    };
    module2.exports = function(opts) {
      return new MemoryStorage(opts);
    };
  }
});

// ../../../../node_modules/multer/index.js
var require_multer = __commonJS({
  "../../../../node_modules/multer/index.js"(exports2, module2) {
    "use strict";
    var makeMiddleware = require_make_middleware();
    var diskStorage = require_disk();
    var memoryStorage = require_memory();
    var MulterError = require_multer_error();
    function allowAll(req, file, cb) {
      cb(null, true);
    }
    function Multer(options) {
      if (options.storage) {
        this.storage = options.storage;
      } else if (options.dest) {
        this.storage = diskStorage({ destination: options.dest });
      } else {
        this.storage = memoryStorage();
      }
      this.limits = options.limits;
      this.preservePath = options.preservePath;
      this.defParamCharset = options.defParamCharset || "latin1";
      this.fileFilter = options.fileFilter || allowAll;
    }
    Multer.prototype._makeMiddleware = function(fields, fileStrategy) {
      function setup() {
        var fileFilter = this.fileFilter;
        var filesLeft = /* @__PURE__ */ Object.create(null);
        fields.forEach(function(field) {
          if (typeof field.maxCount === "number") {
            filesLeft[field.name] = field.maxCount;
          } else {
            filesLeft[field.name] = Infinity;
          }
        });
        function wrappedFileFilter(req, file, cb) {
          if ((filesLeft[file.fieldname] || 0) <= 0) {
            return cb(new MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
          }
          filesLeft[file.fieldname] -= 1;
          fileFilter(req, file, cb);
        }
        return {
          limits: this.limits,
          preservePath: this.preservePath,
          defParamCharset: this.defParamCharset,
          storage: this.storage,
          fileFilter: wrappedFileFilter,
          fileStrategy
        };
      }
      return makeMiddleware(setup.bind(this));
    };
    Multer.prototype.single = function(name) {
      return this._makeMiddleware([{ name, maxCount: 1 }], "VALUE");
    };
    Multer.prototype.array = function(name, maxCount) {
      return this._makeMiddleware([{ name, maxCount }], "ARRAY");
    };
    Multer.prototype.fields = function(fields) {
      return this._makeMiddleware(fields, "OBJECT");
    };
    Multer.prototype.none = function() {
      return this._makeMiddleware([], "NONE");
    };
    Multer.prototype.any = function() {
      function setup() {
        return {
          limits: this.limits,
          preservePath: this.preservePath,
          defParamCharset: this.defParamCharset,
          storage: this.storage,
          fileFilter: this.fileFilter,
          fileStrategy: "ARRAY"
        };
      }
      return makeMiddleware(setup.bind(this));
    };
    function multer2(options) {
      if (options === void 0) {
        return new Multer({});
      }
      if (typeof options === "object" && options !== null) {
        return new Multer(options);
      }
      throw new TypeError("Expected object for argument options");
    }
    module2.exports = multer2;
    module2.exports.diskStorage = diskStorage;
    module2.exports.memoryStorage = memoryStorage;
    module2.exports.MulterError = MulterError;
  }
});

// src/modules/notifiction/notification.service.ts
var notification_service_exports = {};
__export(notification_service_exports, {
  broadcast: () => broadcast,
  deleteAll: () => deleteAll,
  deleteNotification: () => deleteNotification,
  findAll: () => findAll3,
  getUnreadCount: () => getUnreadCount,
  markAllRead: () => markAllRead,
  markRead: () => markRead,
  send: () => send
});
var send, broadcast, findAll3, markRead, markAllRead, deleteNotification, deleteAll, getUnreadCount;
var init_notification_service = __esm({
  "src/modules/notifiction/notification.service.ts"() {
    "use strict";
    init_db();
    init_pagination_util();
    init_socket();
    send = async (dto) => {
      const notification = await db_default.notification.create({
        data: {
          userId: dto.userId,
          title: dto.title,
          body: dto.body,
          type: dto.type,
          referenceId: dto.referenceId,
          isRead: false
        }
      });
      try {
        emitToUser(dto.userId, "notification:new", {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          referenceId: notification.referenceId,
          createdAt: notification.createdAt,
          isRead: notification.isRead
        });
      } catch (err) {
        console.error("Failed to emit notification:new:", err);
      }
      return notification;
    };
    broadcast = async (dto) => {
      const users = dto.role === "ALL" ? await db_default.user.findMany({ select: { id: true } }) : await db_default.user.findMany({ where: { role: dto.role }, select: { id: true } });
      if (!users.length) throw new Error("No users found for the specified role");
      await db_default.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          title: dto.title,
          body: dto.body,
          type: dto.type,
          referenceId: dto.referenceId,
          isRead: false
        }))
      });
      try {
        emitToRole(dto.role, "notification:new", {
          title: dto.title,
          body: dto.body,
          type: dto.type,
          referenceId: dto.referenceId,
          isRead: false,
          createdAt: /* @__PURE__ */ new Date()
        });
      } catch (err) {
        console.error("Failed to emit role broadcast:", err);
      }
      return {
        sent: users.length
      };
    };
    findAll3 = async (userId, query) => {
      const { page = "1", limit = "20", isRead, type } = query;
      const where = {
        userId,
        ...type && { type },
        ...isRead !== void 0 && { isRead: isRead === "true" }
      };
      const { skip, take, meta } = await paginate(
        db_default.notification,
        where,
        parseInt(page, 10),
        parseInt(limit, 10)
      );
      const [notifications, unreadCount] = await Promise.all([
        db_default.notification.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" }
        }),
        db_default.notification.count({ where: { userId, isRead: false } })
      ]);
      return { notifications, unreadCount, meta };
    };
    markRead = async (userId, notificationId) => {
      const notification = await db_default.notification.findFirst({
        where: { id: notificationId, userId }
      });
      if (!notification) throw new Error("Notification not found");
      if (notification.isRead) return notification;
      const updated = await db_default.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: /* @__PURE__ */ new Date() }
      });
      try {
        emitToUser(userId, "notification:read", { id: notificationId });
      } catch (err) {
        console.error("Failed to emit notification:read:", err);
      }
      return updated;
    };
    markAllRead = async (userId) => {
      const { count } = await db_default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: /* @__PURE__ */ new Date() }
      });
      try {
        emitToUser(userId, "notification:readAll", {});
      } catch (err) {
        console.error("Failed to emit notification:readAll:", err);
      }
      return { marked: count };
    };
    deleteNotification = async (id, userId) => {
      const notification = await db_default.notification.findUnique({
        where: { id }
      });
      if (!notification || notification.userId !== userId) throw new Error("Notification not found or not authorized");
      return await db_default.notification.delete({
        where: { id }
      });
    };
    deleteAll = async (userId) => {
      const { count } = await db_default.notification.deleteMany({
        where: { userId }
      });
      return { deleted: count };
    };
    getUnreadCount = async (userId) => {
      const count = await db_default.notification.count({
        where: { userId, isRead: false }
      });
      return { unreadCount: count };
    };
  }
});

// src/index.ts
var import_express21 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_dotenv = __toESM(require("dotenv"));
var import_http = __toESM(require("http"));
init_socket();

// src/middleware/error.middle.ts
init_logger();
var errorMiddleware = (err, req, res, next) => {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  logger_default.error(`[ERROR] ${req.method} ${req.path} -> ${status} ${message}`, err);
  res.status(status).json({ success: false, message });
};

// src/index.ts
init_logger();

// src/routes/index.ts
var import_express20 = __toESM(require("express"));

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
init_db();

// src/utils/jwt.util.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var accessSecret = process.env.JWT_ACCESS_SECRET;
var refreshSecret = process.env.JWT_REFRESH_SECRET;
var generateAccessToken = (payload) => {
  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return import_jsonwebtoken.default.sign(payload, accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
};
var generateRefreshToken = (payload) => {
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }
  return import_jsonwebtoken.default.sign(payload, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
};
var verifyAccessToken = (token) => {
  try {
    return import_jsonwebtoken.default.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
};
var verifyRefreshToken = (token) => {
  try {
    return import_jsonwebtoken.default.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
};

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_node_crypto = require("crypto");
var import_nodemailer = __toESM(require("nodemailer"));
var sendEmail = async ({ to, subject, text }) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("SMTP credentials are not configured");
  }
  const transporter2 = import_nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass }
  });
  await transporter2.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject,
    text
  });
};
var USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true
};
var AuthService = class {
  // ─── PRIVATE: one shared token-issuing path for every login flow ──
  async _issueTokens(user) {
    if (!user.isActive) {
      throw new Error("Your account has been deactivated");
    }
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    if (user.role === "STUDENT" && user.studentProfile?.id) {
      tokenPayload.studentId = user.studentProfile.id;
    }
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    await db_default.$transaction([
      db_default.refreshToken.deleteMany({ where: { userId: user.id } }),
      db_default.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
        }
      })
    ]);
    return { accessToken, refreshToken };
  }
  // ─── PRIVATE: write one AuditLog row, never let logging break the flow ─
  async _logAudit(userId, action, metadata) {
    try {
      await db_default.auditLog.create({
        data: { userId, action, targetType: "User", targetId: userId, metadata }
      });
    } catch {
    }
  }
  async register(dto) {
    const existing = await db_default.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new Error("User already Registered");
    }
    const hashedPassword = await import_bcryptjs.default.hash(dto.password, 10);
    const user = await db_default.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role
      },
      select: USER_SELECT
    });
    await this._logAudit(user.id, "REGISTER", { role: dto.role });
    return user;
  }
  async login(dto) {
    const user = await db_default.user.findUnique({
      where: { email: dto.email },
      include: { studentProfile: true }
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isMatch = await import_bcryptjs.default.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
    const { accessToken, refreshToken } = await this._issueTokens(user);
    await this._logAudit(user.id, "LOGIN");
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
  async refreshToken(dto) {
    const payload = verifyRefreshToken(dto.refreshToken);
    if (!payload) {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }
    const user = await db_default.user.findUnique({
      where: { id: payload.id },
      include: { studentProfile: true }
    });
    if (!user) {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }
    const storedToken = await db_default.refreshToken.findFirst({
      where: { userId: user.id, token: dto.refreshToken, expiresAt: { gte: /* @__PURE__ */ new Date() } }
    });
    if (!storedToken) {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }
    const { accessToken, refreshToken } = await this._issueTokens(user);
    return { accessToken, refreshToken };
  }
  async logout(userId) {
    await db_default.refreshToken.deleteMany({ where: { userId } });
    await this._logAudit(userId, "LOGOUT");
  }
  async changePassword(userId, dto) {
    const user = await db_default.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = await import_bcryptjs.default.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
    const hashed = await import_bcryptjs.default.hash(dto.newPassword, 10);
    await db_default.$transaction([
      db_default.user.update({ where: { id: userId }, data: { passwordHash: hashed } }),
      db_default.refreshToken.deleteMany({ where: { userId } })
    ]);
    await this._logAudit(userId, "CHANGE_PASSWORD");
  }
  async forgotPassword(dto) {
    const user = await db_default.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return;
    }
    const token = (0, import_node_crypto.randomBytes)(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    await db_default.passwordReset.create({
      data: { userId: user.id, otp: token, expiresAt, used: false }
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`
    });
    await this._logAudit(user.id, "FORGOT_PASSWORD_REQUEST");
  }
  async resetPassword(dto) {
    const resetRequest = await db_default.passwordReset.findFirst({
      where: { otp: dto.token, used: false, expiresAt: { gte: /* @__PURE__ */ new Date() } }
    });
    if (!resetRequest) {
      throw new Error("Invalid or expired reset token");
    }
    const hashed = await import_bcryptjs.default.hash(dto.newPassword, 10);
    await db_default.$transaction([
      db_default.user.update({ where: { id: resetRequest.userId }, data: { passwordHash: hashed } }),
      db_default.passwordReset.update({ where: { id: resetRequest.id }, data: { used: true } }),
      db_default.refreshToken.deleteMany({ where: { userId: resetRequest.userId } })
    ]);
    await this._logAudit(resetRequest.userId, "RESET_PASSWORD");
  }
  async getme(userId) {
    const user = await db_default.user.findUnique({ where: { id: userId }, select: USER_SELECT });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
  async studentLogin(dto) {
    const user = await db_default.user.findUnique({
      where: { email: dto.email },
      include: { studentProfile: { include: { admissionRecord: true } } }
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!user.isActive) {
      throw new Error("Your account is deactivated. Please contact admin.");
    }
    if (user.role !== "STUDENT") {
      throw new Error("This account is not a student account");
    }
    if (!user.studentProfile) {
      throw new Error("Student profile not found");
    }
    const admission = user.studentProfile.admissionRecord;
    if (!admission || admission.status !== "APPROVED") {
      throw new Error("Your admission is not verified yet. Please wait for admin approval.");
    }
    const isMatch = await import_bcryptjs.default.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
    const { accessToken, refreshToken } = await this._issueTokens(user);
    await this._logAudit(user.id, "STUDENT_LOGIN");
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentProfile.studentId,
        studentClass: user.studentProfile.classId
      }
    };
  }
};

// src/utils/response.util.ts
var sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

// src/modules/auth/auth.controller.ts
var authService = new AuthService();
function _setAuthCookies(res, accessToken, refreshToken) {
  const isProd3 = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd3,
    sameSite: "lax"
  };
  res.cookie("accessToken", accessToken, { ...base, maxAge: 24 * 60 * 60 * 1e3 });
  res.cookie("refreshToken", refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1e3 });
}
function _forward(next, error, fallbackMessage, fallbackStatus = 400) {
  const status = typeof error === "object" && error && "status" in error ? error.status : fallbackStatus;
  const message = error instanceof Error ? error.message : fallbackMessage;
  next({ status, message });
}
var AuthController = {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user, message: "User Registered Successfully" });
    } catch (error) {
      _forward(next, error, "Registration Failed");
    }
  },
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: "Login Successful" });
    } catch (error) {
      _forward(next, error, "Login Failed");
    }
  },
  async studentLogin(req, res, next) {
    try {
      const data = await authService.studentLogin(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: "Student Login Successful" });
    } catch (error) {
      _forward(next, error, "Student Login Failed");
    }
  },
  async refreshToken(req, res, next) {
    try {
      const data = await authService.refreshToken(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: "Token Refreshed Successfully" });
    } catch (error) {
      _forward(next, error, "Token Refresh Failed", 401);
    }
  },
  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ success: true, message: "Logout Successful" });
    } catch (error) {
      _forward(next, error, "Logout Failed");
    }
  },
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      sendSuccess(res, null, "Password changed successfully");
    } catch (err) {
      _forward(next, err, "Password Change Failed");
    }
  },
  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body);
      sendSuccess(res, null, "If that email is registered, a reset link has been sent");
    } catch (err) {
      _forward(next, err, "Request Failed");
    }
  },
  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      sendSuccess(res, null, "Password reset successfully");
    } catch (err) {
      _forward(next, err, "Password Reset Failed");
    }
  },
  async getMe(req, res, next) {
    try {
      const user = await authService.getme(req.user.id);
      sendSuccess(res, user, "Profile fetched");
    } catch (err) {
      _forward(next, err, "Could Not Fetch Profile", 404);
    }
  }
};

// src/middleware/auth.middleware.ts
init_logger();
var authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  logger_default.debug(`[AUTH] Authenticating: ${req.method} ${req.path}`);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|; )accessToken=([^;]+)/);
    token = match?.[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid token or expired token " });
  }
  req.user = decoded;
  next();
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
var authController = AuthController;
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/student-login", authController.studentLogin.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));
router.use(authenticate);
router.get("/me", authController.getMe.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.patch("/change-password", authController.changePassword.bind(authController));
var auth_route_default = router;

// src/modules/student/students.route.ts
var import_express2 = require("express");

// src/modules/student/student.service.ts
init_db();
var import_bcryptjs3 = __toESM(require("bcryptjs"));
init_pagination_util();

// src/modules/student/student.maPPer.ts
var GENDER_MAP = { "Male": "MALE", "Female": "FEMALE", "Other": "OTHER" };
var BLOOD_GROUP_MAP = {
  "A+": "A_POS",
  "A-": "A_NEG",
  "B+": "B_POS",
  "B-": "B_NEG",
  "AB+": "AB_POS",
  "AB-": "AB_NEG",
  "O+": "O_POS",
  "O-": "O_NEG"
};
function mapGender(input) {
  const mapped = GENDER_MAP[input];
  if (!mapped) throw new Error(`Invalid gender: ${input}`);
  return mapped;
}
function mapBloodGroup(input) {
  if (!input) return void 0;
  return BLOOD_GROUP_MAP[input] ?? input;
}

// src/modules/student/student.validation.ts
function assertValidRollNumber(raw) {
  const rollNumber = Number(raw);
  if (!Number.isInteger(rollNumber)) {
    throw new Error("Roll number must be a valid number");
  }
  return rollNumber;
}
function assertValidDob(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    throw new Error("Invalid dateOfBirth format");
  }
  return dob;
}

// src/modules/student/student.helPer.ts
function notFoundError(message) {
  return Object.assign(new Error(message), { status: 404 });
}
async function findAvailableSection(tx, classId) {
  const sections = await tx.section.findMany({
    where: { classId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" }
  });
  const section = sections.find((s) => s._count.students < s.maxCapacity);
  if (!section) throw new Error("All sections are full \u2014 create a new section or increase the capacity of existing sections");
  return section;
}
async function assertRollNumberAvailable(tx, sectionId, rollNumber, excludeStudentId) {
  const existing = await tx.student.findFirst({
    where: {
      sectionId,
      rollNumber,
      ...excludeStudentId && { id: { not: excludeStudentId } }
    }
  });
  if (existing) throw new Error("Roll number already exists in this section");
}

// src/modules/student/student.Parents.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
async function linkOrCreateGuardian(tx, guardian) {
  if (!guardian.guardianName || !guardian.guardianEmail) return null;
  let parentRecord = await tx.parent.findFirst({
    where: { user: { email: guardian.guardianEmail } }
  });
  if (!parentRecord) {
    const existingUser = await tx.user.findUnique({ where: { email: guardian.guardianEmail } });
    if (existingUser) {
      throw new Error(
        `This email (${guardian.guardianEmail}) is already in use by another ${existingUser.role} account`
      );
    }
    const parentUser = await tx.user.create({
      data: {
        name: guardian.guardianName,
        email: guardian.guardianEmail,
        passwordHash: await import_bcryptjs2.default.hash(Math.random().toString(36), 10),
        role: "PARENT"
      }
    });
    parentRecord = await tx.parent.create({
      data: {
        userId: parentUser.id,
        name: guardian.guardianName,
        phone: guardian.guardianPhone || "",
        relation: guardian.guardianRelation
      }
    });
  }
  return parentRecord.id;
}
async function updateGuardian(tx, existingParent, guardian) {
  const { guardianName, guardianPhone, guardianEmail, guardianRelation } = guardian;
  const nothingProvided = guardianName === void 0 && guardianPhone === void 0 && guardianEmail === void 0 && guardianRelation === void 0;
  if (nothingProvided) return void 0;
  if (existingParent?.id) {
    const parentUpdateData = {};
    if (guardianName !== void 0) parentUpdateData.name = guardianName;
    if (guardianPhone !== void 0) parentUpdateData.phone = guardianPhone;
    if (guardianRelation !== void 0) parentUpdateData.relation = guardianRelation;
    if (Object.keys(parentUpdateData).length > 0) {
      await tx.parent.update({ where: { id: existingParent.id }, data: parentUpdateData });
    }
    if (guardianEmail !== void 0 && existingParent.userId) {
      await tx.user.update({ where: { id: existingParent.userId }, data: { email: guardianEmail } });
    }
    return void 0;
  }
  if (guardianName || guardianEmail) {
    const parentUser = await tx.user.create({
      data: {
        name: guardianName || "Guardian",
        email: guardianEmail || `guardian-${Date.now()}@school.local`,
        passwordHash: await import_bcryptjs2.default.hash(Math.random().toString(36), 10),
        role: "PARENT"
      }
    });
    const parentRecord = await tx.parent.create({
      data: {
        userId: parentUser.id,
        name: guardianName || "Guardian",
        phone: guardianPhone || "",
        relation: guardianRelation
      }
    });
    return parentRecord.id;
  }
  return void 0;
}

// src/modules/student/student.attendence.ts
init_db();
var getAttendance = async (studentId) => {
  const counts = await db_default.studentAttendance.groupBy({
    by: ["status"],
    where: { studentId },
    _count: { _all: true }
  });
  const total = counts.reduce((sum, c12) => sum + c12._count._all, 0);
  const present = counts.find((c12) => c12.status === "PRESENT")?._count._all ?? 0;
  const absent = counts.find((c12) => c12.status === "ABSENT")?._count._all ?? 0;
  const late = counts.find((c12) => c12.status === "LATE")?._count._all ?? 0;
  const percentage = total > 0 ? Math.round(present / total * 100) : 0;
  return { total, present, absent, late, percentage };
};

// src/modules/student/student.result.ts
init_db();
var getResults = async (studentId) => {
  const publishedExamIds = await db_default.reportCard.findMany({
    where: { studentId, status: "PUBLISHED" },
    select: { examId: true }
  }).then((rows) => rows.map((r) => r.examId));
  if (!publishedExamIds.length) {
    return { results: [], totalObtained: 0, totalPossible: 0, percentage: 0 };
  }
  const results = await db_default.mark.findMany({
    where: { studentId, examId: { in: publishedExamIds } },
    include: {
      exam: { select: { name: true } },
      subject: { select: { name: true, fullMarks: true } }
    }
  });
  const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const totalPossible = results.reduce((sum, r) => sum + r.subject.fullMarks, 0);
  const percentage = totalPossible > 0 ? Math.round(totalObtained / totalPossible * 100) : 0;
  return { results, totalObtained, totalPossible, percentage };
};

// src/modules/student/student.service.ts
var StudentService = class {
  static async getStudentIdByUserId(userId) {
    const student = await db_default.student.findUnique({
      where: { userId },
      select: { id: true }
    });
    return student?.id ?? null;
  }
  async createStudent(dto) {
    const rollNumber = assertValidRollNumber(dto.rollNumber);
    const dob = assertValidDob(String(dto.dateOfBirth));
    if (dto.email) {
      const emailExists = await db_default.user.findUnique({ where: { email: dto.email } });
      if (emailExists) throw new Error("Email already exists");
    }
    const classExists = await db_default.class.findUnique({ where: { id: dto.classId } });
    if (!classExists) throw new Error("Class not found");
    return db_default.$transaction(async (tx) => {
      const section = await findAvailableSection(tx, dto.classId);
      await assertRollNumberAvailable(tx, section.id, rollNumber);
      const hashedPassword = dto.password ? await import_bcryptjs3.default.hash(dto.password, 10) : "";
      const studentId = `STU-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email || `student-${Date.now()}@school.local`,
          passwordHash: hashedPassword,
          role: "STUDENT",
          studentProfile: {
            create: {
              studentId,
              rollNumber,
              sectionId: section.id,
              classId: dto.classId,
              dob,
              gender: mapGender(dto.gender),
              bloodGroup: mapBloodGroup(dto.bloodGroup),
              photo: dto.avatarUrl,
              address: dto.address,
              name: dto.name
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          studentProfile: {
            select: {
              id: true,
              studentId: true,
              rollNumber: true,
              classId: true,
              sectionId: true,
              dob: true,
              gender: true,
              bloodGroup: true,
              photo: true,
              address: true,
              name: true
            }
          }
        }
      });
      const parentId = await linkOrCreateGuardian(tx, dto);
      if (parentId && user.studentProfile?.id) {
        await tx.student.update({ where: { id: user.studentProfile.id }, data: { parentId } });
      }
      return user;
    }, { isolationLevel: "Serializable" });
  }
  async findAllStudents(query) {
    const { page = "1", limit = "10", search, classId, gender } = query;
    const where = {
      ...classId && { classId },
      ...gender && { gender },
      ...search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          ...isNaN(Number(search)) ? [] : [{ rollNumber: Number(search) }]
        ]
      }
    };
    const { skip, take, meta } = await paginate(db_default.student, where, parseInt(page), parseInt(limit));
    const students = await db_default.student.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
        parent: {
          select: {
            phone: true,
            name: true,
            user: { select: { email: true } }
          }
        },
        class: { select: { id: true, name: true } },
        admissionRecord: { select: { guardianPhone: true, guardianEmail: true, guardianName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    const flattened = students.map((student) => {
      const guardianEmail = student.parent?.user?.email ?? student.admissionRecord?.guardianEmail ?? null;
      return {
        ...student,
        email: student.user?.email,
        guardianEmail: guardianEmail ?? "\u2014",
        phone: student.parent?.phone ?? student.admissionRecord?.guardianPhone ?? null
      };
    });
    return { data: flattened, meta };
  }
  /** Staff-only detail view — full history, not publish-gated. Keep behind staff routes. */
  async findStudentById(id) {
    const student = await db_default.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
        class: { select: { id: true, name: true, sections: true } },
        attendances: { take: 10, orderBy: { date: "desc" } },
        marks: {
          include: {
            exam: { select: { name: true } },
            subject: { select: { name: true } }
          },
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        feeStructures: { take: 5, orderBy: { dueDate: "desc" } }
      }
    });
    if (!student) throw notFoundError("Student not found");
    return student;
  }
  async getStudentForEdit(id) {
    const student = await db_default.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        parent: {
          select: { id: true, name: true, phone: true, relation: true, user: { select: { email: true } } }
        }
      }
    });
    if (!student) throw notFoundError("Student not found");
    return {
      id: student.id,
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.user?.email,
      phone: student.parent?.phone,
      address: student.address,
      dateOfBirth: student.dob ? student.dob.toISOString().split("T")[0] : null,
      gender: student.gender,
      bloodGroup: student.bloodGroup,
      avatarUrl: student.photo,
      religion: student.religion,
      classId: student.classId,
      className: student.class?.name,
      sectionId: student.sectionId,
      sectionName: student.section?.name,
      isActive: student.isActive,
      guardianName: student.parent?.name,
      guardianEmail: student.parent?.user?.email,
      guardianPhone: student.parent?.phone,
      guardianRelation: student.parent?.relation,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };
  }
  async findStudentByUserId(userId) {
    const student = await db_default.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        parent: {
          select: { id: true, name: true, phone: true, relation: true, user: { select: { email: true } } }
        },
        admissionRecord: { select: { status: true } }
      }
    });
    if (!student) throw notFoundError("Student profile not found");
    return student;
  }
  async update(id, dto) {
    const student = await db_default.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        parent: { select: { id: true, userId: true, name: true, phone: true } }
      }
    });
    if (!student) throw new Error("Student not found");
    if (dto.classId) {
      const classExists = await db_default.class.findUnique({ where: { id: dto.classId } });
      if (!classExists) throw new Error("Class not found");
    }
    const {
      name,
      email,
      dateOfBirth,
      address,
      bloodGroup,
      avatarUrl,
      classId,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelation
    } = dto;
    const dob = dateOfBirth ? assertValidDob(dateOfBirth) : void 0;
    if (email && email !== student.user.email) {
      const existingUser = await db_default.user.findUnique({ where: { email } });
      if (existingUser) throw new Error("Email already in use by another user");
    }
    return db_default.$transaction(async (tx) => {
      const userUpdate = {};
      if (name !== void 0) userUpdate.name = name;
      if (email !== void 0) userUpdate.email = email;
      const studentUpdateData = {};
      if (name !== void 0) studentUpdateData.name = name;
      if (address !== void 0) studentUpdateData.address = address;
      if (avatarUrl !== void 0) studentUpdateData.photo = avatarUrl;
      if (bloodGroup !== void 0) studentUpdateData.bloodGroup = mapBloodGroup(bloodGroup);
      if (dob !== void 0) studentUpdateData.dob = dob;
      if (classId !== void 0 && classId !== student.classId) {
        const newSection = await findAvailableSection(tx, classId);
        await assertRollNumberAvailable(tx, newSection.id, student.rollNumber, id);
        studentUpdateData.class = { connect: { id: classId } };
        studentUpdateData.section = { connect: { id: newSection.id } };
      }
      if (Object.keys(userUpdate).length > 0) {
        studentUpdateData.user = { update: userUpdate };
      }
      const newParentId = await updateGuardian(tx, student.parent, {
        guardianName,
        guardianPhone,
        guardianEmail,
        guardianRelation
      });
      if (newParentId) studentUpdateData.parentId = newParentId;
      return tx.student.update({
        where: { id },
        data: studentUpdateData,
        include: {
          user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          parent: { select: { id: true, name: true, phone: true } }
        }
      });
    }, { isolationLevel: "Serializable" });
  }
  /** Soft delete — the safe default. */
  async deactivate(id) {
    const student = await db_default.student.findUnique({ where: { id } });
    if (!student) throw new Error("Student not found");
    await db_default.$transaction([
      db_default.student.update({ where: { id }, data: { isActive: false } }),
      db_default.user.update({ where: { id: student.userId }, data: { isActive: false } })
    ]);
  }
  async reactivate(id) {
    const student = await db_default.student.findUnique({ where: { id } });
    if (!student) throw new Error("Student not found");
    await db_default.$transaction([
      db_default.student.update({ where: { id }, data: { isActive: true } }),
      db_default.user.update({ where: { id: student.userId }, data: { isActive: true } })
    ]);
  }
  /**
   * NOTE: named `deleteStudent`, not `delete` — `delete` is a reserved word in
   * JS/TS and `export const delete = ...` is a syntax error. This worked
   * before only because it was a class *method* name (`async delete(id)`),
   * which is allowed; a top-level function export can't use it.
   */
  async deleteStudent(id) {
    const student = await db_default.student.findUnique({ where: { id } });
    if (!student) throw new Error("Student not found");
    const [attendanceCount, markCount, paymentCount] = await Promise.all([
      db_default.studentAttendance.count({ where: { studentId: id } }),
      db_default.mark.count({ where: { studentId: id } }),
      db_default.payment.count({ where: { studentId: id } })
    ]);
    if (attendanceCount > 0 || markCount > 0 || paymentCount > 0) {
      throw {
        status: 409,
        message: "\u098F\u0987 student-\u098F\u09B0 attendance/marks/payment history \u0986\u099B\u09C7 \u2014 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09AF\u09BE\u09AC\u09C7 \u09A8\u09BE, deactivate \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8"
      };
    }
    await db_default.user.delete({ where: { id: student.userId } });
  }
  /** Controller-facing alias for the hard delete (reserved-word safe). */
  async delete(id) {
    return this.deleteStudent(id);
  }
  async uploadAvatar(studentId, avatarUrl) {
    const student = await db_default.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error("Student not found");
    return db_default.student.update({ where: { id: studentId }, data: { photo: avatarUrl } });
  }
  async getAttendance(studentId) {
    return getAttendance(studentId);
  }
  async getResults(studentId) {
    return getResults(studentId);
  }
  async getClassRoutine(studentId) {
    const student = await db_default.student.findUnique({
      where: { id: studentId },
      select: { classId: true, sectionId: true }
    });
    if (!student) throw notFoundError("Student not found");
    return db_default.timetable.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } }
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
  }
  async getStudentDashboard(userId) {
    const student = await this.findStudentByUserId(userId);
    const [attendance, results] = await Promise.all([
      getAttendance(student.id),
      getResults(student.id)
    ]);
    return {
      student: {
        id: student.id,
        name: student.user?.name,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        classId: student.classId,
        className: student.class?.name,
        sectionId: student.sectionId,
        sectionName: student.section?.name
      },
      attendance,
      results
    };
  }
};

// src/config/cloudinary.ts
var import_cloudinary = require("cloudinary");
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var cloudinary_default = import_cloudinary.v2;
var uploadToCloudinary = (fileBuffer, folder) => new Promise((resolve, reject) => {
  const stream = import_cloudinary.v2.uploader.upload_stream({ folder }, (error, result) => {
    if (error || !result) return reject(error || new Error("Upload failed"));
    resolve({ secure_url: result.secure_url });
  });
  stream.end(fileBuffer);
});

// src/modules/student/student.controllet.ts
var studentService = new StudentService();
var StudentController = class {
  async create(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body);
      sendSuccess(res, student, "Student created successfully", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAll(req, res, next) {
    try {
      const data = await studentService.findAllStudents(req.query);
      sendSuccess(res, data, "Students fetched");
    } catch (err) {
      next(err);
    }
  }
  async findById(req, res, next) {
    try {
      const student = await studentService.findStudentById(String(req.params.id));
      sendSuccess(res, student, "Student fetched");
    } catch (err) {
      next(err);
    }
  }
  async getStudentForEdit(req, res, next) {
    try {
      const student = await studentService.getStudentForEdit(String(req.params.id));
      sendSuccess(res, student, "Student data fetched for edit");
    } catch (err) {
      next(err);
    }
  }
  async getMyProfile(req, res, next) {
    try {
      console.log(`
[STUDENT] getMyProfile called - User ID: ${req.user?.id}`);
      const student = await studentService.findStudentByUserId(req.user.id);
      const admissionStatus = student.admissionRecord?.status;
      if (admissionStatus && admissionStatus !== "APPROVED") {
        console.log(`[STUDENT] \u26A0\uFE0F Admission not approved - Status: ${admissionStatus}`);
        sendSuccess(res, {
          id: student.id,
          pending: true,
          admissionStatus,
          message: `Your admission is ${admissionStatus.toLowerCase()}. Waiting for admin approval.`
        }, "Student profile pending approval");
        return;
      }
      console.log(`[STUDENT] \u2705 Profile found and returned - Admission: APPROVED`);
      sendSuccess(res, student, "Student profile fetched");
    } catch (err) {
      console.log(`[STUDENT] Error fetching profile:`, err?.message);
      if (err?.message?.includes("not found")) {
        console.log(`[STUDENT] \u26A0\uFE0F Student profile not found for user: ${req.user.id}, but user exists`);
        sendSuccess(res, {
          id: req.user.id,
          pending: true,
          message: "Student profile is pending. Please complete your admission application."
        }, "Student profile pending approval");
        return;
      }
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const student = await studentService.update(String(req.params.id), req.body);
      sendSuccess(res, student, "Student updated");
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      await studentService.delete(String(req.params.id));
      sendSuccess(res, null, "Student deleted");
    } catch (err) {
      next(err);
    }
  }
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_default.uploader.upload_stream({ folder: "students/avatars" }, (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({ secure_url: uploadResult.secure_url });
        });
        stream.end(req.file.buffer);
      });
      const student = await studentService.uploadAvatar(String(req.params.id), result.secure_url);
      sendSuccess(res, student, "Avatar uploaded");
    } catch (err) {
      next(err);
    }
  }
  async getAttendanceSummary(req, res, next) {
    try {
      const data = await studentService.getAttendance(String(req.params.id));
      sendSuccess(res, data, "Attendance summary fetched");
    } catch (err) {
      next(err);
    }
  }
  async getResultSummary(req, res, next) {
    try {
      const data = await studentService.getResults(String(req.params.id));
      sendSuccess(res, data, "Result summary fetched");
    } catch (err) {
      next(err);
    }
  }
  async getClassRoutine(req, res, next) {
    try {
      const student = await studentService.findStudentByUserId(req.user.id);
      const data = await studentService.getClassRoutine(student.id);
      sendSuccess(res, data, "Class routine fetched");
    } catch (err) {
      next(err);
    }
  }
  async getDashboard(req, res, next) {
    try {
      const data = await studentService.getStudentDashboard(req.user.id);
      sendSuccess(res, data, "Student dashboard data fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/middleware/role.middleware.ts
init_logger();
var authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have the required role to access this resource" });
    }
    if (!roles.includes(req.user.role)) {
      logger_default.warn(`[ROLE] Access denied - User ${req.user.role}, required [${roles.join(", ")}]`);
      return res.status(403).json({ success: false, message: "Forbidden: You do not have the required role to access this resource" });
    }
    next();
  };
};

// src/utils/upload.middleware.ts
var import_multer = __toESM(require_multer());
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP allowed"));
    }
  }
});

// src/modules/student/students.route.ts
var router2 = (0, import_express2.Router)();
var studentController = new StudentController();
router2.use(authenticate);
router2.get("/me", authorizeRoles("STUDENT"), studentController.getMyProfile.bind(studentController));
router2.get("/dashboard/my-dashboard", authorizeRoles("STUDENT"), studentController.getDashboard.bind(studentController));
router2.get("/routine/my-routine", authorizeRoles("STUDENT"), studentController.getClassRoutine.bind(studentController));
router2.post(
  "/",
  authorizeRoles("SCHOOL_ADMIN"),
  studentController.create.bind(studentController)
);
router2.get(
  "/",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT"),
  studentController.findAll.bind(studentController)
);
router2.get(
  "/:id/edit",
  authorizeRoles("SCHOOL_ADMIN"),
  studentController.getStudentForEdit.bind(studentController)
);
router2.get(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT"),
  studentController.findById.bind(studentController)
);
router2.put(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN"),
  studentController.update.bind(studentController)
);
router2.delete(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN"),
  studentController.delete.bind(studentController)
);
router2.patch(
  "/:id/avatar",
  authorizeRoles("SCHOOL_ADMIN"),
  upload.single("avatar"),
  studentController.uploadAvatar.bind(studentController)
);
router2.get(
  "/:id/attendance",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  studentController.getAttendanceSummary.bind(studentController)
);
router2.get(
  "/:id/results",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  studentController.getResultSummary.bind(studentController)
);
var students_route_default = router2;

// src/modules/subject/subject.router.ts
var import_express3 = require("express");

// src/modules/subject/subject.service.ts
init_db();
function assertValidMarks(fullMarks, passMarks) {
  if (fullMarks !== void 0 && passMarks !== void 0 && passMarks > fullMarks) {
    throw { status: 400, message: "passMarks cannot be greater than fullMarks" };
  }
}
function isDuplicateConstraintError(err) {
  return err?.code === "P2002";
}
var createSubject = async (dto) => {
  assertValidMarks(dto.fullMarks, dto.passMarks);
  const [classExists, existingName, existingCode] = await Promise.all([
    db_default.class.findUnique({ where: { id: dto.classId }, select: { id: true } }),
    db_default.subject.findFirst({ where: { name: dto.name, classId: dto.classId }, select: { id: true } }),
    db_default.subject.findFirst({ where: { code: dto.code, classId: dto.classId }, select: { id: true } })
  ]);
  if (!classExists) throw { status: 404, message: "Class not found" };
  if (existingName) throw { status: 409, message: "Subject with this name already exists in this class" };
  if (existingCode) throw { status: 409, message: "Subject with this code already exists in this class" };
  if (dto.teacherId) {
    const teacherExists = await db_default.teacher.findUnique({ where: { id: dto.teacherId }, select: { id: true } });
    if (!teacherExists) throw { status: 404, message: "Teacher not found" };
  }
  const { teacherId, isOptional, classId, ...rest } = dto;
  try {
    return await db_default.subject.create({
      data: {
        ...rest,
        isCompulsory: typeof isOptional === "boolean" ? !isOptional : true,
        class: { connect: { id: classId } },
        assignments: teacherId ? {
          create: {
            teacher: { connect: { id: teacherId } }
          }
        } : void 0
      },
      include: {
        class: true,
        assignments: {
          include: {
            teacher: true
          }
        }
      }
    });
  } catch (err) {
    if (isDuplicateConstraintError(err)) {
      throw { status: 409, message: "Subject with this name or code already exists in this class" };
    }
    throw err;
  }
};
var getAllSubjects = async (classId) => {
  return await db_default.subject.findMany({
    where: classId ? { classId } : {},
    include: {
      class: true,
      assignments: {
        include: {
          teacher: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });
};
var getSubjectById = async (id) => {
  const subject = await db_default.subject.findUnique({
    where: { id },
    include: {
      class: true,
      assignments: {
        include: {
          teacher: true
        }
      }
    }
  });
  if (!subject) throw { status: 404, message: "Subject not found" };
  return subject;
};
var updateSubject = async (id, dto) => {
  const current = await getSubjectById(id);
  assertValidMarks(
    dto.fullMarks ?? current.fullMarks,
    dto.passMarks ?? current.passMarks
  );
  if (dto.name && dto.name !== current.name) {
    const existingName = await db_default.subject.findFirst({
      where: { name: dto.name, classId: current.classId, NOT: { id } },
      select: { id: true }
    });
    if (existingName) throw { status: 409, message: "Subject with this name already exists in this class" };
  }
  if (dto.code && dto.code !== current.code) {
    const existingCode = await db_default.subject.findFirst({
      where: { code: dto.code, classId: current.classId, NOT: { id } },
      select: { id: true }
    });
    if (existingCode) throw { status: 409, message: "Subject with this code already exists in this class" };
  }
  if (dto.teacherId) {
    const teacherExists = await db_default.teacher.findUnique({ where: { id: dto.teacherId }, select: { id: true } });
    if (!teacherExists) throw { status: 404, message: "Teacher not found" };
  }
  const { teacherId, isOptional, ...rest } = dto;
  try {
    return await db_default.subject.update({
      where: { id },
      data: {
        ...rest,
        isCompulsory: typeof isOptional === "boolean" ? !isOptional : void 0,
        assignments: teacherId ? {
          upsert: {
            where: { subjectId_teacherId: { subjectId: id, teacherId } },
            update: {},
            create: {
              teacher: { connect: { id: teacherId } }
            }
          }
        } : void 0
      },
      include: {
        class: true,
        assignments: {
          include: {
            teacher: true
          }
        }
      }
    });
  } catch (err) {
    if (isDuplicateConstraintError(err)) {
      throw { status: 409, message: "Subject with this name or code already exists in this class" };
    }
    throw err;
  }
};
var deleteSubject = async (id) => {
  await getSubjectById(id);
  return await db_default.subject.delete({ where: { id } });
};
var assignTeacher = async (subjectId, teacherId) => {
  await getSubjectById(subjectId);
  const teacherExists = await db_default.teacher.findUnique({ where: { id: teacherId }, select: { id: true } });
  if (!teacherExists) throw { status: 404, message: "Teacher not found" };
  await db_default.$transaction([
    db_default.subjectAssignment.deleteMany({
      where: { subjectId, NOT: { teacherId } }
    }),
    db_default.subjectAssignment.upsert({
      where: { subjectId_teacherId: { subjectId, teacherId } },
      update: {},
      create: {
        subject: { connect: { id: subjectId } },
        teacher: { connect: { id: teacherId } }
      }
    })
  ]);
  return await getSubjectById(subjectId);
};
var unassignTeacher = async (subjectId) => {
  await getSubjectById(subjectId);
  await db_default.subjectAssignment.deleteMany({ where: { subjectId } });
  return await getSubjectById(subjectId);
};

// src/modules/subject/subject.controller.ts
var createSubject2 = async (req, res, next) => {
  try {
    const data = await createSubject(req.body);
    sendSuccess(res, data, "Subject created", 201);
  } catch (err) {
    next(err);
  }
};
var getAllSubjects2 = async (req, res, next) => {
  try {
    const classId = req.query.classId;
    const data = await getAllSubjects(classId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getSubjectById2 = async (req, res, next) => {
  try {
    const data = await getSubjectById(String(req.params.id));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var updateSubject2 = async (req, res, next) => {
  try {
    const data = await updateSubject(String(req.params.id), req.body);
    sendSuccess(res, data, "Subject updated");
  } catch (err) {
    next(err);
  }
};
var deleteSubject2 = async (req, res, next) => {
  try {
    await deleteSubject(String(req.params.id));
    sendSuccess(res, null, "Subject deleted");
  } catch (err) {
    next(err);
  }
};
var assignTeacher2 = async (req, res, next) => {
  try {
    if (!req.body?.teacherId) {
      throw { status: 400, message: "teacherId is required" };
    }
    const data = await assignTeacher(String(req.params.id), String(req.body.teacherId));
    sendSuccess(res, data, "Teacher assigned");
  } catch (err) {
    next(err);
  }
};
var unassignTeacher2 = async (req, res, next) => {
  try {
    const data = await unassignTeacher(String(req.params.id));
    sendSuccess(res, data, "Teacher unassigned");
  } catch (err) {
    next(err);
  }
};

// src/modules/subject/subject.router.ts
var router3 = (0, import_express3.Router)();
router3.post("/", authenticate, authorizeRoles("SCHOOL_ADMIN"), createSubject2);
router3.get("/", authenticate, getAllSubjects2);
router3.get("/:id", authenticate, getSubjectById2);
router3.put("/:id", authenticate, authorizeRoles("SCHOOL_ADMIN"), updateSubject2);
router3.delete("/:id", authenticate, authorizeRoles("SCHOOL_ADMIN"), deleteSubject2);
router3.patch("/:id/assign-teacher", authenticate, authorizeRoles("SCHOOL_ADMIN"), assignTeacher2);
router3.delete("/:id/assign-teacher", authenticate, authorizeRoles("SCHOOL_ADMIN"), unassignTeacher2);
var subject_router_default = router3;

// src/modules/class/class.route.ts
var import_express4 = require("express");

// src/modules/class/class.service.ts
init_db();
var MIN_CLASS_LEVEL = 1;
var MAX_CLASS_LEVEL = 10;
function assertValidLevel(level) {
  if (level < MIN_CLASS_LEVEL || level > MAX_CLASS_LEVEL) {
    throw new Error(`Class level must be between ${MIN_CLASS_LEVEL} and ${MAX_CLASS_LEVEL}`);
  }
}
var createClass = async (dto) => {
  assertValidLevel(dto.numericLevel);
  const existing = await db_default.class.findUnique({ where: { name: dto.name } });
  if (existing) {
    throw new Error("Class with this name already exists");
  }
  return db_default.class.create({
    data: {
      name: dto.name,
      numericLevel: dto.numericLevel
    }
  });
};
var getAllClasses = async () => {
  const classes = await db_default.class.findMany({
    include: {
      sections: {
        include: { classTeacher: true },
        orderBy: { name: "asc" }
      },
      _count: { select: { students: true } }
    }
  });
  return classes.map((cls) => ({
    ...cls,
    studentCount: cls._count?.students ?? 0
  }));
};
var getClassById = async (id) => {
  const cls = await db_default.class.findUnique({
    where: { id },
    include: {
      sections: {
        include: { classTeacher: true },
        orderBy: { name: "asc" }
      },
      _count: { select: { students: true } }
    }
  });
  if (!cls) {
    throw new Error("Class not found");
  }
  return {
    ...cls,
    studentCount: cls._count?.students ?? 0
  };
};
var updateClass = async (id, dto) => {
  await getClassById(id);
  if (dto.numericLevel !== void 0) {
    assertValidLevel(dto.numericLevel);
  }
  return db_default.class.update({
    where: { id },
    data: {
      name: dto.name,
      numericLevel: dto.numericLevel
    }
  });
};
var deleteClass = async (id) => {
  await getClassById(id);
  const studentCount = await db_default.student.count({ where: { classId: id } });
  if (studentCount > 0) {
    throw {
      status: 409,
      message: `${studentCount} students are currently enrolled in this class. Please move them to another class before deleting.`
    };
  }
  await db_default.section.deleteMany({ where: { classId: id } });
  return db_default.class.delete({ where: { id } });
};
var createSection = async (dto) => {
  if (!dto.maxCapacity || dto.maxCapacity <= 0) {
    throw new Error("maxCapacity must be a positive number");
  }
  const existing = await db_default.section.findFirst({
    where: { name: dto.name, classId: dto.classId }
  });
  if (existing) {
    throw new Error("Section with this name already exists in this class");
  }
  try {
    return await db_default.section.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        classTeacherId: dto.classTeacherId,
        maxCapacity: dto.maxCapacity
      },
      include: { class: true }
    });
  } catch (err) {
    if (err?.code === "P2002") {
      throw new Error("Section with this name already exists in this class");
    }
    throw err;
  }
};
var getSectionsByClass = async (classId) => {
  return db_default.section.findMany({
    where: { classId },
    include: { classTeacher: true },
    orderBy: { name: "asc" }
  });
};
var updateSection = async (id, dto) => {
  const section = await db_default.section.findUnique({ where: { id } });
  if (!section) throw { status: 404, message: "Section not found" };
  if (dto.maxCapacity !== void 0 && dto.maxCapacity <= 0) {
    throw new Error("maxCapacity must be a positive number");
  }
  if (dto.maxCapacity !== void 0) {
    const currentCount = await db_default.student.count({ where: { sectionId: id } });
    if (dto.maxCapacity < currentCount) {
      throw new Error(
        `${currentCount} students are enrolled in this section \u2014 capacity cannot be reduced below this number`
      );
    }
  }
  return db_default.section.update({
    where: { id },
    data: {
      name: dto.name,
      classTeacherId: dto.classTeacherId,
      maxCapacity: dto.maxCapacity
    }
  });
};
var deleteSection = async (id) => {
  const section = await db_default.section.findUnique({ where: { id } });
  if (!section) throw { status: 404, message: "Section not found" };
  const studentCount = await db_default.student.count({ where: { sectionId: id } });
  if (studentCount > 0) {
    throw {
      status: 409,
      message: `${studentCount} students are currently enrolled in this section. Please move them to another section before deleting.`
    };
  }
  return db_default.section.delete({ where: { id } });
};

// src/modules/class/class.controller.ts
var asParamString = (value) => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};
var createClass2 = async (req, res, next) => {
  try {
    const data = await createClass(req.body);
    sendSuccess(res, data, "Class created", 201);
  } catch (err) {
    next(err);
  }
};
var getAllClasses2 = async (req, res, next) => {
  try {
    const data = await getAllClasses();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getClassById2 = async (req, res, next) => {
  try {
    const data = await getClassById(asParamString(req.params.id));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var updateClass2 = async (req, res, next) => {
  try {
    const data = await updateClass(asParamString(req.params.id), req.body);
    sendSuccess(res, data, "Class updated");
  } catch (err) {
    next(err);
  }
};
var deleteClass2 = async (req, res, next) => {
  try {
    await deleteClass(asParamString(req.params.id));
    sendSuccess(res, null, "Class deleted");
  } catch (err) {
    next(err);
  }
};
var createSection2 = async (req, res, next) => {
  try {
    const data = await createSection(req.body);
    sendSuccess(res, data, "Section created", 201);
  } catch (err) {
    next(err);
  }
};
var getSectionsByClass2 = async (req, res, next) => {
  try {
    const data = await getSectionsByClass(asParamString(req.params.classId));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var updateSection2 = async (req, res, next) => {
  try {
    const data = await updateSection(asParamString(req.params.id), req.body);
    sendSuccess(res, data, "Section updated");
  } catch (err) {
    next(err);
  }
};
var deleteSection2 = async (req, res, next) => {
  try {
    await deleteSection(asParamString(req.params.id));
    sendSuccess(res, null, "Section deleted");
  } catch (err) {
    next(err);
  }
};

// src/modules/class/class.route.ts
var router4 = (0, import_express4.Router)();
var CLASS_MANAGERS = ["SCHOOL_ADMIN", "SUPER_ADMIN"];
router4.post("/", authenticate, authorizeRoles(...CLASS_MANAGERS), createClass2);
router4.get("/", authenticate, getAllClasses2);
router4.get("/:id", authenticate, getClassById2);
router4.put("/:id", authenticate, authorizeRoles(...CLASS_MANAGERS), updateClass2);
router4.delete("/:id", authenticate, authorizeRoles(...CLASS_MANAGERS), deleteClass2);
router4.post("/sections", authenticate, authorizeRoles(...CLASS_MANAGERS), createSection2);
router4.get("/:classId/sections", authenticate, getSectionsByClass2);
router4.put("/sections/:id", authenticate, authorizeRoles(...CLASS_MANAGERS), updateSection2);
router4.delete("/sections/:id", authenticate, authorizeRoles(...CLASS_MANAGERS), deleteSection2);
var class_route_default = router4;

// src/modules/exam/exam.route.ts
var import_express5 = require("express");

// src/modules/exam/exam.controller.ts
init_db();

// src/modules/exam/exam.service.ts
var import_client2 = require("@prisma/client");

// src/generated/prisma/enums.ts
var ResultStatus = {
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED"
};

// src/modules/exam/exam.service.ts
init_db();
function mapExamType(type) {
  if (!type) return void 0;
  return type === "FINAL" ? "FINAL_EXAM" : type;
}
var createExam = async (dto) => {
  const examType = mapExamType(dto.type) ?? "CLASS_TEST";
  const rawDate = dto.startDate ?? dto.date;
  const parsedDate = rawDate ? new Date(rawDate) : /* @__PURE__ */ new Date();
  const createdAt = Number.isNaN(parsedDate.getTime()) ? /* @__PURE__ */ new Date() : parsedDate;
  const existing = await db_default.exam.findFirst({
    where: { name: dto.name, type: examType }
  });
  if (existing) {
    throw { status: 409, message: "Exam with this name and type already exists" };
  }
  return db_default.exam.create({
    data: {
      name: dto.name,
      type: examType,
      createdAt,
      schedules: {
        create: [{
          classId: dto.classId,
          subjectId: dto.subjectId,
          examDate: createdAt,
          startTime: dto.startTime,
          endTime: dto.endTime
        }]
      },
      totalMarks: dto.totalMarks
    },
    include: {
      schedules: { include: { subject: true, class: true } }
    }
  });
};
var getAllExams = async (classId) => {
  const exams = await db_default.exam.findMany({
    where: classId ? { schedules: { some: { classId } } } : void 0,
    include: {
      schedules: {
        where: classId ? { classId } : void 0,
        // FIX: only this class's schedules when filtered
        include: { subject: true, class: true },
        orderBy: { examDate: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return exams;
};
var getExamScheduleForClass = async (classId) => {
  return db_default.examSchedule.findMany({
    where: { classId },
    include: {
      subject: { select: { id: true, name: true, fullMarks: true } },
      exam: { select: { id: true, name: true, type: true } }
    },
    orderBy: { examDate: "asc" }
  });
};
var getExamById = async (id) => {
  const exam = await db_default.exam.findUnique({
    where: { id },
    include: {
      schedules: { include: { subject: true, class: true } },
      // FIX: `result` isn't a real relation on Exam — it's `reportCards`.
      // The old field name would throw a Prisma validation error on every call.
      reportCards: { include: { student: true } }
    }
  });
  if (!exam) {
    throw new Error("Exam not found");
  }
  return exam;
};
var updateExam = async (id, dto) => {
  await getExamById(id);
  const examType = mapExamType(dto.type);
  return db_default.exam.update({
    where: { id },
    data: {
      name: dto.name,
      type: examType,
      createdAt: dto.startDate ? new Date(dto.startDate) : void 0
    }
  });
};
var deleteExam = async (id) => {
  await getExamById(id);
  return db_default.exam.delete({ where: { id } });
};
var publishExam = async (id, actorUserId) => {
  await getExamById(id);
  const updated = await db_default.reportCard.updateMany({
    where: { examId: id },
    data: { status: ResultStatus.PUBLISHED }
  });
  try {
    await db_default.auditLog.create({
      data: {
        userId: actorUserId,
        action: "EXAM_RESULT_PUBLISH",
        targetId: id,
        meta: { affectedReportCards: updated.count },
        timestamp: /* @__PURE__ */ new Date()
      }
    });
  } catch (err) {
    console.warn("Audit log failed:", err?.message);
  }
  return { examId: id, status: ResultStatus.PUBLISHED, affectedReportCards: updated.count };
};
var unpublishExam = async (id, actorUserId) => {
  await getExamById(id);
  const updated = await db_default.reportCard.updateMany({
    where: { examId: id },
    data: { status: ResultStatus.UNPUBLISHED }
  });
  try {
    await db_default.auditLog.create({
      data: {
        userId: actorUserId,
        action: "EXAM_RESULT_UNPUBLISH",
        targetId: id,
        meta: { affectedReportCards: updated.count },
        timestamp: /* @__PURE__ */ new Date()
      }
    });
  } catch (err) {
    console.warn("Audit log failed:", err?.message);
  }
  return { examId: id, status: ResultStatus.UNPUBLISHED, affectedReportCards: updated.count };
};
var createExamSchedule = async (dto) => {
  await getExamById(dto.examId);
  const subject = await db_default.subject.findUnique({
    where: { id: dto.subjectId },
    select: { id: true, classId: true }
  });
  if (!subject) {
    throw { status: 404, message: "Subject not found" };
  }
  if (subject.classId !== dto.classId) {
    throw { status: 400, message: "Subject does not belong to the selected class" };
  }
  try {
    return await db_default.examSchedule.create({
      data: {
        examId: dto.examId,
        classId: dto.classId,
        subjectId: dto.subjectId,
        examDate: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime
      },
      include: { subject: true, exam: true, class: true }
    });
  } catch (error) {
    if (error instanceof import_client2.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw { status: 409, message: "Schedule already exists for this exam, class and subject" };
    }
    throw error;
  }
};
var getScheduleByExam = async (examId) => {
  return db_default.examSchedule.findMany({
    where: { examId },
    include: { subject: true },
    orderBy: { examDate: "asc" }
  });
};
var deleteSchedule = async (id) => {
  const schedule = await db_default.examSchedule.findUnique({ where: { id } });
  if (!schedule) throw { status: 404, message: "Schedule not found" };
  return db_default.examSchedule.delete({ where: { id } });
};
var resolveGrade = (marksObtained, fullMarks, rules) => {
  const percent = fullMarks === 0 ? 0 : marksObtained / fullMarks * 100;
  const matchedRule = rules.find((rule) => percent >= rule.minPercent && percent <= rule.maxPercent);
  return { grade: matchedRule?.grade, gpa: matchedRule?.gpa, percent };
};
var submitExamMarks = async (examId, dto, authUser) => {
  await getExamById(examId);
  if (!dto.entries?.length) {
    throw { status: 400, message: "At least one mark entry is required" };
  }
  let teacherIdFromAuth = null;
  if (authUser.role === "TEACHER") {
    const teacher = await db_default.teacher.findUnique({
      where: { userId: authUser.id },
      select: { id: true }
    });
    if (!teacher) {
      throw { status: 403, message: "Teacher profile not found for this user" };
    }
    teacherIdFromAuth = teacher.id;
  }
  const studentIds = [...new Set(dto.entries.map((e) => e.studentId))];
  const subjectIds = [...new Set(dto.entries.map((e) => e.subjectId))];
  const [students, subjects, gradingRules] = await Promise.all([
    db_default.student.findMany({ where: { id: { in: studentIds } }, select: { id: true } }),
    db_default.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, fullMarks: true } }),
    db_default.gradingRule.findMany({
      orderBy: { minPercent: "asc" },
      select: { minPercent: true, maxPercent: true, grade: true, gpa: true }
    })
  ]);
  const studentSet = new Set(students.map((s) => s.id));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  for (const entry of dto.entries) {
    if (!studentSet.has(entry.studentId)) {
      throw { status: 404, message: `Student not found: ${entry.studentId}` };
    }
    const subject = subjectMap.get(entry.subjectId);
    if (!subject) {
      throw { status: 404, message: `Subject not found: ${entry.subjectId}` };
    }
    if (entry.marksObtained < 0 || entry.marksObtained > subject.fullMarks) {
      throw {
        status: 400,
        message: `Marks must be between 0 and ${subject.fullMarks} for subject ${entry.subjectId}`
      };
    }
    const teacherId = teacherIdFromAuth ?? entry.teacherId;
    if (!teacherId) {
      throw {
        status: 400,
        message: `teacherId is required for admin mark entry (student: ${entry.studentId})`
      };
    }
  }
  const requiredPairs = dto.entries.map((entry) => ({
    subjectId: entry.subjectId,
    teacherId: teacherIdFromAuth ?? entry.teacherId
  }));
  const uniquePairs = [...new Map(
    requiredPairs.map((p) => [`${p.subjectId}:${p.teacherId}`, p])
  ).values()];
  const assignments = await db_default.subjectAssignment.findMany({
    where: { OR: uniquePairs.map((p) => ({ subjectId: p.subjectId, teacherId: p.teacherId })) },
    select: { subjectId: true, teacherId: true }
  });
  const assignedSet = new Set(assignments.map((a) => `${a.subjectId}:${a.teacherId}`));
  for (const pair of uniquePairs) {
    if (!assignedSet.has(`${pair.subjectId}:${pair.teacherId}`)) {
      throw {
        status: 403,
        message: `Teacher ${pair.teacherId} is not assigned to subject ${pair.subjectId}`
      };
    }
  }
  const marks = await db_default.$transaction(
    dto.entries.map((entry) => {
      const subject = subjectMap.get(entry.subjectId);
      const teacherId = teacherIdFromAuth ?? entry.teacherId;
      const { grade, gpa } = resolveGrade(entry.marksObtained, subject.fullMarks, gradingRules);
      return db_default.mark.upsert({
        where: {
          studentId_examId_subjectId: {
            studentId: entry.studentId,
            examId,
            subjectId: entry.subjectId
          }
        },
        update: { marksObtained: entry.marksObtained, grade, gpa, teacherId },
        create: {
          studentId: entry.studentId,
          examId,
          subjectId: entry.subjectId,
          marksObtained: entry.marksObtained,
          grade,
          gpa,
          teacherId
        }
      });
    })
  );
  return { examId, totalProcessed: marks.length, marks };
};
var getPublishedResultsForStudent = async (studentId, examId) => {
  const publishedReportCards = await db_default.reportCard.findMany({
    where: {
      studentId,
      status: ResultStatus.PUBLISHED,
      ...examId && { examId }
    },
    include: { exam: { select: { id: true, name: true, type: true } } }
  });
  if (!publishedReportCards.length) return [];
  const publishedExamIds = publishedReportCards.map((rc) => rc.examId);
  const marks = await db_default.mark.findMany({
    where: { studentId, examId: { in: publishedExamIds } },
    include: { subject: { select: { name: true, fullMarks: true, passMarks: true } } }
  });
  return publishedReportCards.map((rc) => ({
    ...rc,
    subjects: marks.filter((m) => m.examId === rc.examId)
  }));
};
var getFailedStudents = async (examId, classId) => {
  await getExamById(examId);
  const allMarks = await db_default.mark.findMany({
    where: {
      examId,
      student: classId ? { section: { classId } } : void 0
    },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          name: true,
          section: {
            select: { id: true, name: true, classId: true, class: { select: { name: true } } }
          }
        }
      },
      subject: { select: { id: true, name: true, passMarks: true } }
    }
  });
  const failedMarks = allMarks.filter((mark) => mark.marksObtained < mark.subject.passMarks);
  const grouped = /* @__PURE__ */ new Map();
  for (const mark of failedMarks) {
    const existing = grouped.get(mark.student.id);
    const failedSubject = {
      subjectId: mark.subject.id,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      passMarks: mark.subject.passMarks
    };
    if (existing) {
      existing.failedSubjects.push(failedSubject);
      continue;
    }
    grouped.set(mark.student.id, { student: mark.student, failedSubjects: [failedSubject] });
  }
  return {
    examId,
    classId: classId ?? null,
    totalFailedStudents: grouped.size,
    students: Array.from(grouped.values())
  };
};

// src/modules/exam/exam.controller.ts
var asParamString2 = (value) => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};
var asOptionalQueryString = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : void 0;
  return void 0;
};
var createExam2 = async (req, res, next) => {
  try {
    const data = await createExam(req.body);
    sendSuccess(res, data, "Exam created", 201);
  } catch (err) {
    next(err);
  }
};
var getAllExams2 = async (req, res, next) => {
  try {
    const classId = asOptionalQueryString(req.query.classId);
    const data = await getAllExams(classId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getExamById2 = async (req, res, next) => {
  try {
    const data = await getExamById(asParamString2(req.params.id));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var updateExam2 = async (req, res, next) => {
  try {
    const data = await updateExam(asParamString2(req.params.id), req.body);
    sendSuccess(res, data, "Exam updated");
  } catch (err) {
    next(err);
  }
};
var deleteExam2 = async (req, res, next) => {
  try {
    await deleteExam(asParamString2(req.params.id));
    sendSuccess(res, null, "Exam deleted");
  } catch (err) {
    next(err);
  }
};
var publishExam2 = async (req, res, next) => {
  try {
    const data = await publishExam(asParamString2(req.params.id), req.user.id);
    sendSuccess(res, data, "Exam published");
  } catch (err) {
    next(err);
  }
};
var unpublishExam2 = async (req, res, next) => {
  try {
    const data = await unpublishExam(asParamString2(req.params.id), req.user.id);
    sendSuccess(res, data, "Exam unpublished");
  } catch (err) {
    next(err);
  }
};
var createSchedule = async (req, res, next) => {
  try {
    const data = await createExamSchedule(req.body);
    sendSuccess(res, data, "Schedule created", 201);
  } catch (err) {
    next(err);
  }
};
var getScheduleByExam2 = async (req, res, next) => {
  try {
    const data = await getScheduleByExam(asParamString2(req.params.examId));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var deleteSchedule2 = async (req, res, next) => {
  try {
    await deleteSchedule(asParamString2(req.params.id));
    sendSuccess(res, null, "Schedule deleted");
  } catch (err) {
    next(err);
  }
};
var submitExamMarks2 = async (req, res, next) => {
  try {
    const authUser = req.user;
    if (!authUser) throw { status: 401, message: "Unauthorized" };
    const data = await submitExamMarks(asParamString2(req.params.examId), req.body, authUser);
    sendSuccess(res, data, "Marks submitted");
  } catch (err) {
    next(err);
  }
};
var getFailedStudents2 = async (req, res, next) => {
  try {
    const data = await getFailedStudents(
      asParamString2(req.params.examId),
      asOptionalQueryString(req.query.classId)
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getMyExamSchedule = async (req, res, next) => {
  try {
    const student = await db_default.student.findFirst({
      where: { userId: req.user.id },
      select: { classId: true }
    });
    if (!student) throw { status: 404, message: "Student profile not found" };
    const data = await getExamScheduleForClass(student.classId);
    sendSuccess(res, data, "Exam schedule fetched");
  } catch (err) {
    next(err);
  }
};
var getMyResults = async (req, res, next) => {
  try {
    const student = await db_default.student.findFirst({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (!student) throw { status: 404, message: "Student profile not found" };
    const examId = asOptionalQueryString(req.query.examId);
    const data = await getPublishedResultsForStudent(student.id, examId);
    sendSuccess(res, data, "Your results fetched");
  } catch (err) {
    next(err);
  }
};
async function resolveOwnedChild(userId, studentId) {
  const parent = await db_default.parent.findFirst({ where: { userId }, select: { id: true } });
  if (!parent) throw { status: 404, message: "Parent profile not found" };
  const child = await db_default.student.findFirst({
    where: { id: studentId, parentId: parent.id },
    select: { id: true, classId: true }
  });
  if (!child) throw { status: 403, message: "This student is not linked to your account" };
  return child;
}
var getChildExamSchedule = async (req, res, next) => {
  try {
    const child = await resolveOwnedChild(req.user.id, asParamString2(req.params.studentId));
    const data = await getExamScheduleForClass(child.classId);
    sendSuccess(res, data, "Child's exam schedule fetched");
  } catch (err) {
    next(err);
  }
};
var getChildResults = async (req, res, next) => {
  try {
    const child = await resolveOwnedChild(req.user.id, asParamString2(req.params.studentId));
    const examId = asOptionalQueryString(req.query.examId);
    const data = await getPublishedResultsForStudent(child.id, examId);
    sendSuccess(res, data, "Child's results fetched");
  } catch (err) {
    next(err);
  }
};

// src/modules/exam/exam.route.ts
var router5 = (0, import_express5.Router)();
var EXAM_STAFF = ["EXAM_CONTROLLER", "SCHOOL_ADMIN"];
var EXAM_VIEWERS = ["EXAM_CONTROLLER", "SCHOOL_ADMIN", "TEACHER"];
router5.use(authenticate);
router5.post("/", authorizeRoles(...EXAM_STAFF), createExam2);
router5.get("/", authorizeRoles(...EXAM_VIEWERS), getAllExams2);
router5.get("/:id", authorizeRoles(...EXAM_VIEWERS), getExamById2);
router5.put("/:id", authorizeRoles(...EXAM_STAFF), updateExam2);
router5.delete("/:id", authorizeRoles(...EXAM_STAFF), deleteExam2);
router5.patch("/:id/publish", authorizeRoles(...EXAM_STAFF), publishExam2);
router5.patch("/:id/unpublish", authorizeRoles(...EXAM_STAFF), unpublishExam2);
router5.post("/schedules", authorizeRoles(...EXAM_STAFF), createSchedule);
router5.get("/:examId/schedules", authorizeRoles(...EXAM_VIEWERS), getScheduleByExam2);
router5.delete("/schedules/:id", authorizeRoles(...EXAM_STAFF), deleteSchedule2);
router5.post("/:examId/marks", authorizeRoles("TEACHER", ...EXAM_STAFF), submitExamMarks2);
router5.get("/:examId/failed-students", authorizeRoles("TEACHER", ...EXAM_STAFF), getFailedStudents2);
router5.get("/my/schedule", authorizeRoles("STUDENT"), getMyExamSchedule);
router5.get("/my/results", authorizeRoles("STUDENT"), getMyResults);
router5.get("/child/:studentId/schedule", authorizeRoles("PARENT"), getChildExamSchedule);
router5.get("/child/:studentId/results", authorizeRoles("PARENT"), getChildResults);
var exam_route_default = router5;

// src/modules/attendance/attendacne.router.ts
var import_express6 = require("express");

// src/modules/attendance/attendance.controller.ts
init_db();

// src/modules/attendance/attendance.service.ts
init_db();
init_socket();
var takeAttendance = async (dto, requesterId, requesterRole) => {
  const attendanceDate = new Date(dto.date);
  attendanceDate.setHours(0, 0, 0, 0);
  const existing = await db_default.studentAttendance.findFirst({
    where: {
      sectionId: dto.sectionId,
      date: attendanceDate,
      section: {
        classId: dto.classId
      }
    }
  });
  if (existing) {
    throw new Error("Attendance for this class, section and date already exists");
  }
  let resolvedTeacherId = dto.teacherId;
  if (!resolvedTeacherId) {
    if (requesterRole === "TEACHER") {
      const teacher = await db_default.teacher.findFirst({
        where: { userId: requesterId },
        select: { id: true }
      });
      if (!teacher) throw new Error("Teacher profile not found");
      resolvedTeacherId = teacher.id;
    } else {
      throw new Error("Teacher is required for attendance");
    }
  }
  await db_default.studentAttendance.createMany({
    data: dto.entries.map((entry) => ({
      studentId: entry.studentId,
      sectionId: dto.sectionId,
      teacherId: resolvedTeacherId,
      date: attendanceDate,
      status: entry.status
    })),
    skipDuplicates: true
    // relies on @@unique([studentId, date])
  });
  const records = await db_default.studentAttendance.findMany({
    where: {
      sectionId: dto.sectionId,
      date: attendanceDate,
      studentId: { in: dto.entries.map((e) => e.studentId) }
    }
  });
  try {
    getIO().to("SCHOOL_ADMIN").emit("attendance:taken", {
      classId: dto.classId,
      sectionId: dto.sectionId,
      date: dto.date,
      totalPresent: dto.entries.filter((e) => e.status === "PRESENT").length,
      totalAbsent: dto.entries.filter((e) => e.status === "ABSENT").length,
      totalLate: dto.entries.filter((e) => e.status === "LATE").length
    });
  } catch (err) {
    console.error("Failed to send real-time notification:", err);
  }
  return records;
};
var getAttendanceByDate = async (classId, sectionId, date) => {
  if (!sectionId) throw new Error("sectionId is required");
  if (classId) {
    const section = await db_default.section.findUnique({
      where: { id: sectionId },
      select: { classId: true }
    });
    if (section && section.classId !== classId) {
      throw new Error("Section does not belong to the selected class");
    }
  }
  const d = new Date(date);
  return db_default.studentAttendance.findMany({
    where: {
      sectionId,
      date: {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999))
      }
    },
    // FIX: was `include: { student: true }` — pulls every column
    // (address, photo, religion...) for every row. Only the display
    // fields are needed here.
    select: {
      id: true,
      studentId: true,
      status: true,
      date: true,
      student: {
        select: { id: true, name: true, rollNumber: true, photo: true }
      }
    }
  });
};
var getStudentAttendance = async (student, month, year) => {
  const where = { studentId: student };
  if (month && year) {
    where.date = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0)
    };
  }
  const records = await db_default.studentAttendance.findMany({
    where,
    select: {
      id: true,
      date: true,
      status: true
    },
    orderBy: { date: "desc" },
    take: 50
  });
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const percentage = total > 0 ? Math.round(present / total * 100) : 0;
  return {
    total,
    present,
    absent,
    late,
    percentage,
    Parcentage: percentage,
    // TODO: remove after frontend migrates
    records
  };
};
var updateAttendance = async (id, dto, requesterId, requesterRole) => {
  const record = await db_default.studentAttendance.findUnique({
    where: { id }
  });
  if (!record) throw { status: 404, message: "Attendance record not found" };
  const isSchoolAdmin = requesterRole === "SCHOOL_ADMIN" || requesterRole === "SUPER_ADMIN";
  const hourDiff = (Date.now() - new Date(record.createdAt).getTime()) / (1e3 * 60 * 60);
  if (!isSchoolAdmin && hourDiff > 24) {
    throw { status: 403, message: "Only School Admin can edit attendance after 24 hours" };
  }
  if (!isSchoolAdmin && requesterRole === "TEACHER") {
    const teacher = await db_default.teacher.findFirst({
      where: { userId: requesterId },
      select: { id: true }
    });
    if (!teacher || teacher.id !== record.teacherId) {
      throw { status: 403, message: "You can only edit attendance you recorded" };
    }
  }
  const updated = await db_default.studentAttendance.update({
    where: { id },
    data: dto
  });
  try {
    await db_default.auditLog.create({
      data: {
        userId: requesterId,
        action: "ATTENDANCE_EDIT",
        targetId: id,
        meta: { from: record.status, to: dto.status },
        timestamp: /* @__PURE__ */ new Date()
      }
    });
  } catch (err) {
    console.warn("Audit log failed:", err?.message);
  }
  return updated;
};
var getMonthlyReport = async (classId, sectionId, month, year) => {
  const records = await db_default.studentAttendance.findMany({
    where: {
      sectionId,
      section: { classId },
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0)
      }
    },
    select: {
      studentId: true,
      status: true,
      student: {
        select: { id: true, name: true, rollNumber: true }
      }
    }
  });
  const grouped = {};
  for (const r of records) {
    if (!grouped[r.studentId]) {
      grouped[r.studentId] = {
        student: r.student,
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      };
    }
    grouped[r.studentId].total += 1;
    if (r.status === "PRESENT") grouped[r.studentId].present += 1;
    else if (r.status === "ABSENT") grouped[r.studentId].absent += 1;
    else if (r.status === "LATE") grouped[r.studentId].late += 1;
  }
  return Object.values(grouped).map((g) => ({
    ...g,
    percentage: Math.round(g.present / g.total * 100),
    belowThreshold: Math.round(g.present / g.total * 100) < 75
  }));
};

// src/modules/attendance/attendance.controller.ts
var AttendanceController = class {
  /** Teacher / School Admin — take attendance for a section */
  async take(req, res, next) {
    try {
      const records = await takeAttendance(req.body, req.user.id, req.user.role);
      sendSuccess(res, records, "Attendance recorded", 201);
    } catch (err) {
      next(err);
    }
  }
  /** Teacher / School Admin — view a section's attendance for a specific date */
  async byDate(req, res, next) {
    try {
      const { classId, sectionId, date } = req.query;
      const data = await getAttendanceByDate(classId, sectionId, date);
      sendSuccess(res, data, "Attendance fetched");
    } catch (err) {
      next(err);
    }
  }
  /**
   * Student — view own attendance.
   * FIX target: studentId must NEVER come from the client (params/query/body).
   * It is always resolved from the authenticated user's own Student profile,
   * so a student cannot view anyone else's records by editing a URL.
   */
  async myAttendance(req, res, next) {
    try {
      const student = await db_default.student.findFirst({
        where: { userId: req.user.id },
        select: { id: true }
      });
      if (!student) throw { status: 404, message: "Student profile not found" };
      const { month, year } = req.query;
      const data = await getStudentAttendance(
        student.id,
        month ? Number(month) : void 0,
        year ? Number(year) : void 0
      );
      sendSuccess(res, data, "Your attendance fetched");
    } catch (err) {
      next(err);
    }
  }
  /**
   * Parent — view a specific child's attendance.
   * FIX target: the requested studentId is only served if it actually
   * belongs to this parent's account (Student.parentId === this parent's id).
   * Without this check, any parent could view any other student's attendance
   * by guessing/enumerating studentId — a direct Privacy NFR violation.
   */
  async childAttendance(req, res, next) {
    try {
      const parent = await db_default.parent.findFirst({
        where: { userId: req.user.id },
        select: { id: true }
      });
      if (!parent) throw { status: 404, message: "Parent profile not found" };
      const studentId = String(req.params.studentId);
      const child = await db_default.student.findFirst({
        where: { id: studentId, parentId: parent.id },
        select: { id: true }
      });
      if (!child) throw { status: 403, message: "This student is not linked to your account" };
      const { month, year } = req.query;
      const data = await getStudentAttendance(
        child.id,
        month ? Number(month) : void 0,
        year ? Number(year) : void 0
      );
      sendSuccess(res, data, "Child's attendance fetched");
    } catch (err) {
      next(err);
    }
  }
  /** Teacher (own record, within 24h) / School Admin (override) */
  async update(req, res, next) {
    try {
      const updated = await updateAttendance(
        String(req.params.id),
        req.body,
        req.user.id,
        req.user.role
      );
      sendSuccess(res, updated, "Attendance updated");
    } catch (err) {
      next(err);
    }
  }
  /** Teacher / School Admin — monthly per-student report for a section */
  async monthlyReport(req, res, next) {
    try {
      const { classId, sectionId, month, year } = req.query;
      const data = await getMonthlyReport(classId, sectionId, Number(month), Number(year));
      sendSuccess(res, data, "Monthly report generated");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/attendance/attendacne.router.ts
var router6 = (0, import_express6.Router)();
var c = new AttendanceController();
router6.use(authenticate);
router6.post("/take", authorizeRoles("TEACHER", "SCHOOL_ADMIN"), c.take.bind(c));
router6.get("/by-date", authorizeRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"), c.byDate.bind(c));
router6.get("/monthly-report", authorizeRoles("TEACHER", "SCHOOL_ADMIN"), c.monthlyReport.bind(c));
router6.patch("/:id", authorizeRoles("TEACHER", "SCHOOL_ADMIN"), c.update.bind(c));
router6.get("/my-attendance", authorizeRoles("STUDENT"), c.myAttendance.bind(c));
router6.get("/child/:studentId", authorizeRoles("PARENT"), c.childAttendance.bind(c));
var attendacne_router_default = router6;

// src/modules/teachers/teacher.routes.ts
var import_express7 = require("express");

// src/modules/teachers/teachers.service.ts
init_db();
var import_bcryptjs4 = __toESM(require("bcryptjs"));
var import_node_crypto2 = require("crypto");
init_pagination_util();
async function nextAutoEmployeeId() {
  const all = await db_default.teacher.findMany({ select: { employeeId: true } });
  const maxNumeric = all.reduce((max, t) => {
    const n = Number(t.employeeId);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNumeric + 1).padStart(2, "0");
}
var TeachersService = {
  async getTeacherIdByUserId(userId) {
    const teacher = await db_default.teacher.findUnique({
      where: { userId },
      select: { id: true }
    });
    return teacher?.id ?? null;
  },
  async create(dto) {
    const emailExists = await db_default.user.findUnique({ where: { email: dto.email } });
    if (emailExists) {
      throw { status: 409, message: "Email already exists" };
    }
    let employeeId;
    if (dto.TeachersId) {
      employeeId = dto.TeachersId;
      const exists = await db_default.teacher.findUnique({ where: { employeeId } });
      if (exists) {
        throw { status: 409, message: "Teacher ID already exists" };
      }
    } else {
      employeeId = await nextAutoEmployeeId();
    }
    const wasPasswordGenerated = !dto.password;
    const rawPassword = dto.password ?? (0, import_node_crypto2.randomBytes)(4).toString("hex");
    const hashedPassword = await import_bcryptjs4.default.hash(rawPassword, 10);
    const buildData = (id) => ({
      name: dto.name,
      email: dto.email,
      passwordHash: hashedPassword,
      role: "TEACHER",
      teacherProfile: {
        create: {
          employeeId: id,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          designation: dto.designation,
          department: dto.department,
          qualification: dto.qualification,
          experience: dto.experience,
          address: dto.address,
          dateOfBirth: new Date(dto.dateOfBirth),
          joiningDate: new Date(dto.dateOfJoining),
          bloodGroup: dto.bloodGroup,
          salary: dto.salary,
          photo: dto.avatarUrl
        }
      }
    });
    const selectShape = {
      id: true,
      name: true,
      email: true,
      role: true,
      teacherProfile: {
        include: { subjectAssignments: { include: { subject: true } } }
      }
    };
    let newTeacher;
    try {
      newTeacher = await db_default.user.create({ data: buildData(employeeId), select: selectShape });
    } catch (err) {
      if (err?.code === "P2002" && !dto.TeachersId) {
        employeeId = await nextAutoEmployeeId();
        newTeacher = await db_default.user.create({ data: buildData(employeeId), select: selectShape });
      } else {
        throw err;
      }
    }
    let subjectAssignmentWarning;
    if (dto.subjectId && newTeacher.teacherProfile?.id) {
      const subjectExists = await db_default.subject.findUnique({ where: { id: dto.subjectId } });
      if (!subjectExists) {
        subjectAssignmentWarning = `Subject with ID ${dto.subjectId} not found \u2014 teacher created without a subject assignment.`;
      } else {
        try {
          await db_default.subjectAssignment.create({
            data: { subjectId: dto.subjectId, teacherId: newTeacher.teacherProfile.id }
          });
        } catch (err) {
          subjectAssignmentWarning = `Subject assignment failed: ${err?.message ?? "unknown error"}`;
        }
      }
    }
    return {
      ...newTeacher,
      //  an auto-generated password was previously created and then
      // never surfaced anywhere — the account existed but nobody had the
      // credential to log into it. Only present when we generated it, so
      // an admin who supplied their own password never sees this key.
      ...wasPasswordGenerated && { temporaryPassword: rawPassword },
      ...subjectAssignmentWarning && { warning: subjectAssignmentWarning }
    };
  },
  async findAll(query) {
    const { page = "1", limit = "10", search, department, designation } = query;
    const where = {
      //  department/designation were accepted in TeacherQueryDto but
      // never actually applied to the query — filtering by either did
      // nothing before.
      ...department && { department },
      ...designation && { designation },
      ...search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { employeeId: { contains: search, mode: "insensitive" } }
        ]
      }
    };
    const { skip, take, meta } = await paginate(db_default.teacher, where, parseInt(page, 10), parseInt(limit, 10));
    const teachers = await db_default.teacher.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });
    const transformedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender ?? "\u2014",
      createdAt: teacher.createdAt,
      subject: teacher.subjectAssignments?.[0]?.subject?.name ?? teacher.subjectSpecialization ?? "\u2014",
      subjectId: teacher.subjectAssignments?.[0]?.subjectId,
      // FIX: was `teacher.joiningDate` mislabeled as dateOfBirth — now
      // that the column actually exists, use the real value.
      dateOfBirth: teacher.dateOfBirth,
      joiningDate: teacher.joiningDate
    }));
    return { teachers: transformedTeachers, meta };
  },
  async findById(id) {
    const teacher = await db_default.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } }
      }
    });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? "\u2014",
      gender: teacher.gender ?? "\u2014",
      //  these six were all hardcoded placeholders before because
      // the columns didn't exist. Now they return what was actually
      // stored.
      dateOfBirth: teacher.dateOfBirth,
      employeeId: teacher.employeeId,
      designation: teacher.designation ?? "\u2014",
      department: teacher.department ?? "\u2014",
      qualification: teacher.qualification ?? "\u2014",
      experience: teacher.experience ?? 0,
      address: teacher.address ?? "\u2014",
      bloodGroup: teacher.bloodGroup ?? "\u2014",
      joiningDate: teacher.joiningDate,
      salary: teacher.salary ?? 0,
      subject: teacher.subjectAssignments?.[0]?.subject?.name ?? "\u2014",
      subjectId: teacher.subjectAssignments?.[0]?.subjectId ?? null,
      subjectAssignments: teacher.subjectAssignments?.map((sa) => ({
        id: sa.id,
        subjectId: sa.subject.id,
        subjectName: sa.subject.name
      })) ?? [],
      classes: teacher.sectionTeacher?.map((s) => s.class?.name) ?? [],
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    };
  },
  async findByUserId(userId) {
    const teacher = await db_default.teacher.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } }
      }
    });
    if (!teacher) {
      throw { status: 404, message: "Teacher profile not found" };
    }
    return teacher;
  },
  async update(id, dto) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    const { name, avatarUrl, dateOfBirth, ...teacherFields } = dto;
    const updatedTeacher = await db_default.teacher.update({
      where: { id },
      data: {
        ...teacherFields,
        ...dateOfBirth !== void 0 && { dateOfBirth: new Date(dateOfBirth) },
        ...avatarUrl !== void 0 && { photo: avatarUrl },
        ...name && {
          name,
          user: { update: { name } }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } }
      }
    });
    return updatedTeacher;
  },
  //  this hard-deleted the User row (cascading onto Teacher) even
  // though the schema has an `isActive` flag clearly meant for this. A
  // teacher with any Marks, TeacherAttendance, Homework, or Timetable
  // rows (none of which cascade-delete from Teacher) would hit a raw FK
  // violation the moment they'd ever taught a class — deleting a
  // teacher's account also isn't supposed to erase the historical
  // academic records tied to them (grades they entered, attendance they
  // took), same reasoning as fee records with payment history. This now
  // deactivates instead, matching the WAIVED-instead-of-delete pattern.
  async delete(id) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    return db_default.teacher.update({
      where: { id },
      data: { isActive: false }
    });
  },
  async uploadAvatar(id, avatarUrl) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    return db_default.teacher.update({ where: { id }, data: { photo: avatarUrl } });
  },
  async assignSubjects(id, dto) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    const validSubjects = await db_default.subject.findMany({ where: { id: { in: dto.subjectIds } }, select: { id: true } });
    if (validSubjects.length !== dto.subjectIds.length) {
      throw { status: 400, message: "One or more subject IDs are invalid" };
    }
    await db_default.subjectAssignment.deleteMany({ where: { teacherId: id } });
    if (dto.subjectIds.length > 0) {
      await db_default.subjectAssignment.createMany({
        data: dto.subjectIds.map((subjectId) => ({ teacherId: id, subjectId }))
      });
    }
    return db_default.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } }
      }
    });
  },
  async assignClasses(id, dto) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    const sections = await db_default.section.findMany({ where: { classId: { in: dto.classIds } }, select: { id: true } });
    await db_default.teacher.update({
      where: { id },
      data: {
        sectionTeacher: {
          set: sections.map((s) => ({ id: s.id }))
        }
      }
    });
    return db_default.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } }
      }
    });
  },
  async getTeacherSchedule(id) {
    const teacher = await db_default.teacher.findUnique({ where: { id } });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }
    return db_default.timetable.findMany({
      where: { teacherId: id },
      include: {
        subject: { select: { id: true, name: true } },
        section: { select: { id: true, name: true, classId: true, class: { select: { name: true } } } }
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
  },
  async getDashboardStats(teacherId) {
    const teacher = await db_default.teacher.findUnique({
      where: { id: teacherId },
      include: {
        subjectAssignments: { select: { id: true } },
        sectionTeacher: { select: { classId: true } }
      }
    });
    if (!teacher) throw { status: 404, message: "Teacher not found" };
    const classIds = Array.from(new Set(teacher.sectionTeacher.map((s) => s.classId)));
    if (classIds.length === 0) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: teacher.subjectAssignments.length,
        upcomingExams: 0
      };
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [totalStudents, totalClasses, totalSubjects, upcomingExams] = await Promise.all([
      db_default.student.count({
        where: { section: { classId: { in: classIds } } }
      }),
      Promise.resolve(classIds.length),
      Promise.resolve(teacher.subjectAssignments.length),
      db_default.examSchedule.count({
        where: { classId: { in: classIds }, examDate: { gte: today } }
      })
    ]);
    return { totalStudents, totalClasses, totalSubjects, upcomingExams };
  }
};

// src/modules/teachers/teachers.controller.ts
var teacherService = TeachersService;
var ADMIN_LIKE_ROLES = ["SCHOOL_ADMIN", "HR"];
var SENSITIVE_FIELDS = ["salary", "address", "bloodGroup", "dateOfBirth"];
function redactForRole(teacher, role) {
  if (role && ADMIN_LIKE_ROLES.includes(role)) return teacher;
  const copy = { ...teacher };
  for (const field of SENSITIVE_FIELDS) delete copy[field];
  return copy;
}
var TeacherController = class {
  async create(req, res, next) {
    try {
      const teacher = await teacherService.create(req.body);
      sendSuccess(res, teacher, "Teacher created successfully", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAll(req, res, next) {
    try {
      const data = await teacherService.findAll(req.query);
      sendSuccess(res, {
        ...data,
        teachers: data.teachers.map((t) => redactForRole(t, req.user?.role))
      }, "Teachers fetched");
    } catch (err) {
      next(err);
    }
  }
  async findById(req, res, next) {
    try {
      const teacher = await teacherService.findById(String(req.params.id));
      sendSuccess(res, redactForRole(teacher, req.user?.role), "Teacher fetched");
    } catch (err) {
      next(err);
    }
  }
  async getMyProfile(req, res, next) {
    try {
      const teacher = await teacherService.findByUserId(req.user.id);
      sendSuccess(res, teacher, "Teacher profile fetched");
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const teacher = await teacherService.update(String(req.params.id), req.body);
      sendSuccess(res, teacher, "Teacher updated");
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      await teacherService.delete(String(req.params.id));
      sendSuccess(res, null, "Teacher deleted");
    } catch (err) {
      next(err);
    }
  }
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) throw { status: 400, message: "No file uploaded" };
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_default.uploader.upload_stream({ folder: "teachers/avatars" }, (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({ secure_url: uploadResult.secure_url });
        });
        stream.end(req.file.buffer);
      });
      const teacher = await teacherService.uploadAvatar(String(req.params.id), result.secure_url);
      sendSuccess(res, teacher, "Avatar uploaded");
    } catch (err) {
      next(err);
    }
  }
  async assignSubjects(req, res, next) {
    try {
      const teacher = await teacherService.assignSubjects(String(req.params.id), req.body);
      sendSuccess(res, teacher, "Subjects assigned");
    } catch (err) {
      next(err);
    }
  }
  async assignClasses(req, res, next) {
    try {
      const teacher = await teacherService.assignClasses(String(req.params.id), req.body);
      sendSuccess(res, teacher, "Classes assigned");
    } catch (err) {
      next(err);
    }
  }
  async getSchedule(req, res, next) {
    try {
      let teacherId = String(req.params.id);
      const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;
      try {
        const data = await teacherService.getTeacherSchedule(teacherId);
        sendSuccess(res, data, "Schedule fetched");
      } catch (scheduleErr) {
        if (scheduleErr?.status === 404) {
          sendSuccess(res, [], "Schedule fetched");
        } else {
          next(scheduleErr);
        }
      }
    } catch (err) {
      next(err);
    }
  }
  async getDashboardStats(req, res, next) {
    try {
      let teacherId = String(req.params.id);
      const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;
      try {
        const data = await teacherService.getDashboardStats(teacherId);
        sendSuccess(res, data, "Dashboard stats fetched");
      } catch (statsErr) {
        if (statsErr?.status === 404) {
          sendSuccess(res, {
            totalStudents: 0,
            totalClasses: 0,
            totalSubjects: 0,
            upcomingExams: 0
          }, "Dashboard stats fetched");
        } else {
          next(statsErr);
        }
      }
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/teachers/teacher.routes.ts
var router7 = (0, import_express7.Router)();
var teacherController = new TeacherController();
router7.use(authenticate);
router7.get("/me", authorizeRoles("TEACHER"), teacherController.getMyProfile.bind(teacherController));
router7.post("/", authorizeRoles("SCHOOL_ADMIN"), teacherController.create.bind(teacherController));
router7.get(
  "/",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  teacherController.findAll.bind(teacherController)
);
router7.get(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  teacherController.findById.bind(teacherController)
);
router7.patch(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN"),
  teacherController.update.bind(teacherController)
);
router7.delete(
  "/:id",
  authorizeRoles("SCHOOL_ADMIN"),
  teacherController.delete.bind(teacherController)
);
router7.patch(
  "/:id/avatar",
  authorizeRoles("SCHOOL_ADMIN"),
  upload.single("avatar"),
  teacherController.uploadAvatar.bind(teacherController)
);
router7.patch(
  "/:id/assign-subjects",
  authorizeRoles("SCHOOL_ADMIN"),
  teacherController.assignSubjects.bind(teacherController)
);
router7.patch(
  "/:id/assign-classes",
  authorizeRoles("SCHOOL_ADMIN"),
  teacherController.assignClasses.bind(teacherController)
);
router7.get(
  "/:id/schedule",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  teacherController.getSchedule.bind(teacherController)
);
router7.get(
  "/:id/dashboard",
  authorizeRoles("SCHOOL_ADMIN", "TEACHER"),
  teacherController.getDashboardStats.bind(teacherController)
);
var teacher_routes_default = router7;

// src/modules/result/result.router.ts
var import_express8 = require("express");

// src/modules/result/result.controller.ts
init_db();

// src/modules/result/result.service.ts
init_db();
init_socket();
var STAFF_OVERRIDE_ROLES = /* @__PURE__ */ new Set(["SCHOOL_ADMIN", "SUPER_ADMIN", "EXAM_CONTROLLER"]);
async function loadGradingRules() {
  return db_default.gradingRule.findMany({
    orderBy: { minPercent: "asc" },
    select: { minPercent: true, maxPercent: true, grade: true, gpa: true }
  });
}
function resolveGrade2(marksObtained, fullMarks, rules) {
  const percent = fullMarks === 0 ? 0 : marksObtained / fullMarks * 100;
  const matchedRule = rules.find((rule) => percent >= rule.minPercent && percent <= rule.maxPercent);
  return { grade: matchedRule?.grade ?? "F", gpa: matchedRule?.gpa ?? 0, percent };
}
var recalculateAndSaveReportCard = async (studentId, examId, gradingRules) => {
  const marks = await db_default.mark.findMany({
    where: { studentId, examId },
    include: { subject: { select: { fullMarks: true, passMarks: true } } }
  });
  const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
  const rawPercentage = totalFull > 0 ? totalObtained / totalFull * 100 : 0;
  const percentage = Math.round(rawPercentage);
  const failed = marks.some((m) => m.marksObtained < m.subject.passMarks);
  const { grade, gpa } = resolveGrade2(totalObtained, totalFull, gradingRules);
  const reportCard = await db_default.reportCard.upsert({
    where: { studentId_examId: { studentId, examId } },
    create: { studentId, examId, gpa, status: ResultStatus.UNPUBLISHED },
    update: { gpa }
  });
  return { reportCard, totalObtained, totalFull, percentage, grade, gpa, isPassed: !failed };
};
var submitResult = async (dto, authUser) => {
  if (!dto.examId) throw { status: 400, message: "examId is required" };
  const exam = await db_default.exam.findUnique({ where: { id: dto.examId } });
  if (!exam) throw { status: 404, message: "Exam not found" };
  const student = await db_default.student.findUnique({ where: { id: dto.studentId }, select: { id: true } });
  if (!student) throw { status: 404, message: "Student not found" };
  if (!dto.marks.length) throw { status: 400, message: "At least one subject mark is required" };
  let currentTeacherId;
  const isStaffOverride = !!authUser?.role && STAFF_OVERRIDE_ROLES.has(authUser.role);
  if (authUser?.role === "TEACHER") {
    const teacher = await db_default.teacher.findUnique({ where: { userId: authUser.id }, select: { id: true } });
    if (!teacher) throw { status: 403, message: "Teacher profile not found for this user" };
    currentTeacherId = teacher.id;
  } else if (!isStaffOverride) {
    throw { status: 403, message: "You are not authorized to submit exam results" };
  }
  const subjects = await db_default.subject.findMany({
    where: { id: { in: dto.marks.map((m) => m.subjectId) } },
    include: { assignments: { select: { teacherId: true } } }
  });
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const gradingRules = await loadGradingRules();
  await db_default.$transaction(async (tx) => {
    for (const m of dto.marks) {
      const subject = subjectMap.get(m.subjectId);
      if (!subject) throw { status: 404, message: `Subject not found: ${m.subjectId}` };
      if (m.marksObtained < 0 || m.marksObtained > subject.fullMarks) {
        throw { status: 400, message: `Marks must be between 0 and ${subject.fullMarks} for ${subject.name}` };
      }
      let teacherToAssign;
      if (currentTeacherId) {
        const isAssignedToSubject = subject.assignments.some((a) => a.teacherId === currentTeacherId);
        if (!isAssignedToSubject) {
          throw {
            status: 403,
            message: `You are not assigned to teach ${subject.name}. Please use an assigned subject.`
          };
        }
        teacherToAssign = currentTeacherId;
      } else {
        if (subject.assignments.length > 0) {
          teacherToAssign = subject.assignments[0].teacherId;
        } else {
          throw {
            status: 400,
            message: `No teacher assigned to subject "${subject.name}". Please assign a teacher to this subject first.`
          };
        }
      }
      const { grade, gpa } = resolveGrade2(m.marksObtained, subject.fullMarks, gradingRules);
      await tx.mark.upsert({
        where: {
          studentId_examId_subjectId: { studentId: dto.studentId, examId: dto.examId, subjectId: m.subjectId }
        },
        create: {
          studentId: dto.studentId,
          examId: dto.examId,
          subjectId: m.subjectId,
          teacherId: teacherToAssign,
          marksObtained: m.marksObtained,
          grade,
          gpa
        },
        update: {
          teacherId: teacherToAssign,
          marksObtained: m.marksObtained,
          grade,
          gpa
        }
      });
    }
  });
  const summary = await recalculateAndSaveReportCard(dto.studentId, dto.examId, gradingRules);
  if (authUser?.id) {
    await db_default.auditLog.create({
      data: {
        userId: authUser.id,
        action: "RESULT_SUBMITTED",
        targetId: `${dto.studentId}:${dto.examId}`,
        meta: { subjectCount: dto.marks.length },
        timestamp: /* @__PURE__ */ new Date()
      }
    }).catch((err) => console.warn("Audit log failed:", err?.message));
  }
  try {
    getIO().to("EXAM_CONTROLLER").emit("marks:submitted", {
      examId: dto.examId,
      studentId: dto.studentId,
      subjectsGraded: dto.marks.length
    });
  } catch (_) {
  }
  return { success: true, message: "Result submitted successfully", summary };
};
var submitBulkResult = async (dtos, authUser) => {
  if (!dtos || dtos.length === 0) {
    throw { status: 400, message: "No result entries provided" };
  }
  const succeeded = [];
  const failed = [];
  for (const dto of dtos) {
    try {
      const result = await submitResult(dto, authUser);
      succeeded.push(result);
    } catch (error) {
      failed.push({ studentId: dto.studentId, error: error?.message || "Unknown error" });
    }
  }
  return {
    success: failed.length === 0,
    message: `${succeeded.length} succeeded, ${failed.length} failed out of ${dtos.length}`,
    totalProcessed: succeeded.length,
    results: succeeded,
    failures: failed
  };
};
var getResultByStudent = async (studentId, examId, limit = 10) => {
  const publishedExamIds = await db_default.reportCard.findMany({
    where: {
      studentId,
      status: ResultStatus.PUBLISHED,
      ...examId && { examId }
    },
    select: { examId: true }
  }).then((rows) => rows.map((r) => r.examId));
  if (!publishedExamIds.length) {
    return { studentId, examId: examId ?? null, totalObtained: 0, totalFull: 0, percentage: 0, marks: [] };
  }
  const marks = await db_default.mark.findMany({
    where: { studentId, examId: { in: publishedExamIds } },
    select: {
      id: true,
      marksObtained: true,
      grade: true,
      examId: true,
      exam: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, fullMarks: true, passMarks: true } }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
  const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
  const percentage = totalFull > 0 ? Math.round(totalObtained / totalFull * 100) : 0;
  return { studentId, examId: examId ?? null, totalObtained, totalFull, percentage, marks };
};
var getResultByExam = async (examId) => {
  const marks = await db_default.mark.findMany({
    where: { examId },
    include: { student: true, subject: true }
  });
  const gradingRules = await loadGradingRules();
  const grouped = /* @__PURE__ */ new Map();
  for (const mark of marks) {
    const current = grouped.get(mark.studentId);
    const pass = mark.marksObtained >= mark.subject.passMarks;
    const markEntry = {
      id: mark.id,
      subjectId: mark.subjectId,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      fullMarks: mark.subject.fullMarks,
      passMarks: mark.subject.passMarks,
      grade: mark.grade,
      gpa: mark.gpa
    };
    if (!current) {
      grouped.set(mark.studentId, {
        student: mark.student,
        marks: [markEntry],
        totalMarks: mark.marksObtained,
        fullMarks: mark.subject.fullMarks,
        isPassed: pass
      });
      continue;
    }
    current.marks.push(markEntry);
    current.totalMarks += mark.marksObtained;
    current.fullMarks += mark.subject.fullMarks;
    current.isPassed = current.isPassed && pass;
  }
  const results = Array.from(grouped.values()).map((item) => {
    const percentage = item.fullMarks > 0 ? Math.round(item.totalMarks / item.fullMarks * 100) : 0;
    const calculated = resolveGrade2(item.totalMarks, item.fullMarks, gradingRules);
    return {
      student: item.student,
      marks: item.marks,
      totalMarks: item.totalMarks,
      fullMarks: item.fullMarks,
      percentage,
      grade: calculated.grade,
      gpa: calculated.gpa,
      isPassed: item.isPassed
    };
  }).sort((a, b) => b.gpa - a.gpa);
  const total = results.length;
  const passed = results.filter((r) => r.isPassed).length;
  const failedCount = total - passed;
  const avgGpa = total > 0 ? Number((results.reduce((sum, r) => sum + r.gpa, 0) / total).toFixed(2)) : 0;
  return { results, summary: { total, passed, failed: failedCount, avgGpa } };
};
var updateMark = async (id, dto, actorUserId) => {
  const mark = await db_default.mark.findUnique({
    where: { id },
    include: { subject: { select: { fullMarks: true } } }
  });
  if (!mark) throw { status: 404, message: "Mark record not found" };
  if (dto.marksObtained < 0 || dto.marksObtained > mark.subject.fullMarks) {
    throw { status: 400, message: "Marks exceed full marks" };
  }
  const gradingRules = await loadGradingRules();
  const { grade, gpa } = resolveGrade2(dto.marksObtained, mark.subject.fullMarks, gradingRules);
  const updated = await db_default.mark.update({
    where: { id },
    data: { marksObtained: dto.marksObtained, grade, gpa }
  });
  const summary = await recalculateAndSaveReportCard(updated.studentId, updated.examId, gradingRules);
  if (actorUserId) {
    await db_default.auditLog.create({
      data: {
        userId: actorUserId,
        action: "RESULT_MARK_EDITED",
        targetId: id,
        meta: { from: mark.marksObtained, to: dto.marksObtained },
        timestamp: /* @__PURE__ */ new Date()
      }
    }).catch((err) => console.warn("Audit log failed:", err?.message));
  }
  return { mark: updated, summary };
};
var getFailedStudents3 = async (examId) => {
  const marks = await db_default.mark.findMany({
    where: { examId },
    include: { student: true, subject: { select: { id: true, name: true, passMarks: true } } }
  });
  const grouped = /* @__PURE__ */ new Map();
  for (const mark of marks) {
    if (mark.marksObtained >= mark.subject.passMarks) continue;
    const current = grouped.get(mark.studentId);
    const markEntry = {
      id: mark.id,
      subjectId: mark.subject.id,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      passMarks: mark.subject.passMarks
    };
    if (!current) {
      grouped.set(mark.studentId, { student: mark.student, marks: [markEntry] });
      continue;
    }
    current.marks.push(markEntry);
  }
  return Array.from(grouped.values());
};

// src/modules/result/result.controller.ts
var toSingleString = (value) => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : void 0;
  if (value === void 0 || value === null) return void 0;
  return String(value);
};
var submitResult2 = async (req, res, next) => {
  try {
    const authUser = req.user;
    if (!authUser) throw { status: 401, message: "Unauthorized" };
    const examId = req.body.examId || toSingleString(req.query.examId);
    const { studentId, marks } = req.body;
    const data = await submitResult({ examId, studentId, marks }, authUser);
    sendSuccess(res, data, "Result submitted", 201);
  } catch (err) {
    next(err);
  }
};
var submitBulkResult2 = async (req, res, next) => {
  try {
    const authUser = req.user;
    if (!authUser) throw { status: 401, message: "Unauthorized" };
    if (!Array.isArray(req.body)) {
      throw { status: 400, message: "Request body must be an array of result entries" };
    }
    if (req.body.length === 0) {
      throw { status: 400, message: "Please enter marks for at least one student" };
    }
    for (let i = 0; i < req.body.length; i++) {
      const entry = req.body[i];
      if (!entry.examId) throw { status: 400, message: `Student ${i + 1}: examId is missing` };
      if (!entry.studentId) throw { status: 400, message: `Student ${i + 1}: studentId is missing` };
      if (!Array.isArray(entry.marks)) throw { status: 400, message: `Student ${i + 1}: marks must be an array` };
      if (entry.marks.length === 0) throw { status: 400, message: `Student ${i + 1}: no marks provided` };
      for (let j = 0; j < entry.marks.length; j++) {
        const mark = entry.marks[j];
        if (!mark.subjectId) throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: subjectId is missing` };
        if (typeof mark.marksObtained !== "number" || mark.marksObtained < 0) {
          throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: marks must be a non-negative number` };
        }
      }
    }
    const data = await submitBulkResult(req.body, authUser);
    sendSuccess(res, data, "Results submitted", 201);
  } catch (err) {
    next(err);
  }
};
var getResultByStudent2 = async (req, res, next) => {
  try {
    const examId = toSingleString(req.query.examId);
    const studentId = toSingleString(req.params.studentId);
    if (!studentId) throw { status: 400, message: "studentId is required" };
    const data = await getResultByStudent(studentId, examId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getResultByExam2 = async (req, res, next) => {
  try {
    const examId = toSingleString(req.params.examId);
    if (!examId) throw { status: 400, message: "examId is required" };
    const data = await getResultByExam(examId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var updateMark2 = async (req, res, next) => {
  try {
    const id = toSingleString(req.params.id);
    if (!id) throw { status: 400, message: "id is required" };
    const data = await updateMark(id, req.body, req.user?.id);
    sendSuccess(res, data, "Mark updated");
  } catch (err) {
    next(err);
  }
};
var getFailedStudents4 = async (req, res, next) => {
  try {
    const examId = toSingleString(req.params.examId);
    if (!examId) throw { status: 400, message: "examId is required" };
    const data = await getFailedStudents3(examId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
var getMyResults2 = async (req, res, next) => {
  try {
    const student = await db_default.student.findFirst({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (!student) throw { status: 404, message: "Student profile not found" };
    const examId = toSingleString(req.query.examId);
    const data = await getResultByStudent(student.id, examId);
    sendSuccess(res, data, "Your results fetched");
  } catch (err) {
    next(err);
  }
};
var getChildResults2 = async (req, res, next) => {
  try {
    const parent = await db_default.parent.findFirst({ where: { userId: req.user.id }, select: { id: true } });
    if (!parent) throw { status: 404, message: "Parent profile not found" };
    const studentId = toSingleString(req.params.studentId);
    const child = await db_default.student.findFirst({
      where: { id: studentId, parentId: parent.id },
      select: { id: true }
    });
    if (!child) throw { status: 403, message: "This student is not linked to your account" };
    const examId = toSingleString(req.query.examId);
    const data = await getResultByStudent(child.id, examId);
    sendSuccess(res, data, "Child's results fetched");
  } catch (err) {
    next(err);
  }
};

// src/modules/result/result.router.ts
var router8 = (0, import_express8.Router)();
var EXAM_STAFF2 = ["EXAM_CONTROLLER", "SCHOOL_ADMIN", "SUPER_ADMIN"];
router8.use(authenticate);
router8.post("/", authorizeRoles("TEACHER", ...EXAM_STAFF2), submitResult2);
router8.post("/bulk", authorizeRoles("TEACHER", ...EXAM_STAFF2), submitBulkResult2);
router8.get("/student/:studentId", authorizeRoles("TEACHER", ...EXAM_STAFF2), getResultByStudent2);
router8.get("/exam/:examId", authorizeRoles("TEACHER", ...EXAM_STAFF2), getResultByExam2);
router8.get("/exam/:examId/failed", authorizeRoles("TEACHER", ...EXAM_STAFF2), getFailedStudents4);
router8.patch("/marks/:id", authorizeRoles("TEACHER", ...EXAM_STAFF2), updateMark2);
router8.get("/my-results", authorizeRoles("STUDENT"), getMyResults2);
router8.get("/child/:studentId/results", authorizeRoles("PARENT"), getChildResults2);
var result_router_default = router8;

// src/modules/admission/admission.routes.ts
var import_express9 = require("express");

// src/modules/admission/admission.service.ts
init_db();

// src/config/mail.ts
var import_nodemailer2 = __toESM(require("nodemailer"));
var transporter = import_nodemailer2.default.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true",
  // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});
var mailService = {
  async send(options) {
    try {
      const from = process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@sms.local";
      const info = await transporter.sendMail({
        from,
        ...options
      });
      console.log("Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }
  },
  // Send student account creation email with credentials
  async sendStudentCredentials(email, studentName, tempPassword, loginUrl) {
    const subject = "\u{1F393} Your Student Account Has Been Created";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h2 { margin: 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to School Management System \u{1F393}</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>Congratulations! Your admission has been <strong>approved</strong> \u2705</p>
              
              <p>Your student account has been created. Use the credentials below to log in:</p>
              
              <div class="credentials">
                <div class="field">
                  <div class="label">\u{1F4E7} Email (Username):</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">\u{1F510} Temporary Password:</div>
                  <div class="value">${tempPassword}</div>
                </div>
              </div>
              
              <div class="warning">
                <strong> Important:</strong> This is a temporary password. After logging in, you must change it immediately to a secure password of your choice.
              </div>
              
              <p>
                <a href="${loginUrl}" class="button">Go to Dashboard \u2192</a>
              </p>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click the button above or visit: <br><code>${loginUrl}</code></li>
                <li>Log in with your email and temporary password</li>
                <li>Change your password immediately</li>
                <li>Start using your student dashboard!</li>
              </ol>
              
              <p>If you have any issues, please contact the school administration.</p>
              
              <p>Best regards,<br><strong>School Management System</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.send({
      to: email,
      subject,
      html
    });
  },
  // Send parent/guardian account creation email with credentials.
  // The parent account is provisioned by the school on admission approval
  // (the parent does NOT self sign-up), so credentials are emailed here.
  async sendParentCredentials(email, parentName, studentName, tempPassword, loginUrl) {
    const subject = "\u{1F468}\u200D\u{1F469}\u200D\u{1F466} Your Parent Account Has Been Created";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h2 { margin: 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #11998e; margin: 15px 0; border-radius: 4px; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px; }
            .button { display: inline-block; background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome, Parent/Guardian </h2>
            </div>
            <div class="content">
              <p>Dear <strong>${parentName}</strong>,</p>

              <p>A student account for <strong>${studentName}</strong> has been approved, and a parent account has been created for you.</p>

              <p>Use the credentials below to log in and monitor <strong>${studentName}</strong>'s academic progress:</p>

              <div class="credentials">
                <div class="field">
                  <div class="label">\u{1F4E7} Email (Username):</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label"> Temporary Password:</div>
                  <div class="value">${tempPassword}</div>
                </div>
              </div>

              <div class="warning">
                <strong>Important:</strong> This is a temporary password. After logging in, please change it immediately to a secure password of your choice.
              </div>

              <p>
                <a href="${loginUrl}" class="button">Go to Dashboard \u2192</a>
              </p>

              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click the button above or visit: <br><code>${loginUrl}</code></li>
                <li>Log in with your email and temporary password</li>
                <li>Change your password immediately</li>
                <li>Track attendance, results, fees and notices for your child</li>
              </ol>

              <p>If you have any issues, please contact the school administration.</p>

              <p>Best regards,<br><strong>School Management System</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.send({
      to: email,
      subject,
      html
    });
  }
};

// src/modules/admission/admission.service.ts
var import_bcryptjs5 = __toESM(require("bcryptjs"));
var import_node_crypto3 = require("crypto");
var MAX_PAGE_LIMIT = 100;
var AdmissionService = class {
  async create(dto) {
    const classExists = await db_default.class.findUnique({
      where: { id: dto.targetClassId }
    });
    if (!classExists) throw new Error("Class not found");
    const existing = await db_default.admissionApplication.findFirst({
      where: { studentEmail: dto.studentEmail }
    });
    if (existing) {
      throw new Error("An application with this student email already exists");
    }
    return db_default.admissionApplication.create({
      data: {
        applicantName: dto.applicantName,
        studentEmail: dto.studentEmail,
        dob: new Date(dto.dob),
        gender: dto.gender,
        religion: dto.religion,
        bloodGroup: dto.bloodGroup,
        address: dto.address,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        guardianEmail: dto.guardianEmail,
        targetClassId: dto.targetClassId,
        photoUrl: dto.photoUrl,
        birthCertUrl: dto.birthCertUrl,
        status: "PENDING",
        paymentMethod: dto.paymentMethod,
        paymentAmount: dto.paymentAmount,
        transactionId: dto.transactionId,
        paymentStatus: dto.paymentAmount ? "PAID" : "PENDING",
        paymentDate: dto.paymentAmount ? /* @__PURE__ */ new Date() : void 0
      },
      include: {
        targetClass: { select: { name: true, numericLevel: true } }
      }
    });
  }
  async findAll(query) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, MAX_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const where = {
      ...query.status && { status: query.status },
      ...query.classId && { targetClassId: query.classId },
      ...query.search && {
        OR: [
          { applicantName: { contains: query.search, mode: "insensitive" } },
          { guardianName: { contains: query.search, mode: "insensitive" } },
          { guardianPhone: { contains: query.search, mode: "insensitive" } },
          { guardianEmail: { contains: query.search, mode: "insensitive" } }
        ]
      }
    };
    const [data, total] = await Promise.all([
      db_default.admissionApplication.findMany({
        where,
        skip,
        take: limit,
        include: { targetClass: { select: { name: true, numericLevel: true } } },
        orderBy: { createdAt: "desc" }
      }),
      db_default.admissionApplication.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id) {
    const admission = await db_default.admissionApplication.findUnique({
      where: { id },
      include: { targetClass: true }
    });
    if (!admission) throw new Error("Admission not found");
    return admission;
  }
  async update(id, dto) {
    await this._exists(id);
    return db_default.admissionApplication.update({
      where: { id },
      data: {
        applicantName: dto.applicantName,
        ...dto.studentEmail && { studentEmail: dto.studentEmail },
        ...dto.dob && { dob: new Date(dto.dob) },
        gender: dto.gender,
        religion: dto.religion,
        bloodGroup: dto.bloodGroup,
        address: dto.address,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        guardianEmail: dto.guardianEmail,
        targetClassId: dto.targetClassId,
        photoUrl: dto.photoUrl,
        birthCertUrl: dto.birthCertUrl
      }
    });
  }
  async updateStatus(id, dto, actorUserId) {
    const before = await this._exists(id);
    const admission = await db_default.admissionApplication.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        reviewedAt: /* @__PURE__ */ new Date()
      }
    });
    await this._audit(actorUserId, "ADMISSION_STATUS_CHANGE", id, {
      from: before.status,
      to: dto.status,
      rejectionReason: dto.rejectionReason
    });
    if (dto.status === "APPROVED" && !admission.studentId) {
      const studentProfile = await this.createStudentFromAdmission(admission.id);
      const updatedAdmission = await db_default.admissionApplication.findUnique({ where: { id } });
      return updatedAdmission || { ...admission, studentId: studentProfile?.id };
    }
    return admission;
  }
  async convertToStudent(_dto) {
    throw new Error("Convert to student is not implemented yet");
  }
  async delete(id, actorUserId) {
    await this._exists(id);
    const deleted = await db_default.admissionApplication.delete({ where: { id } });
    await this._audit(actorUserId, "ADMISSION_DELETE", id, {});
    return deleted;
  }
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      db_default.admissionApplication.count(),
      db_default.admissionApplication.count({ where: { status: "PENDING" } }),
      db_default.admissionApplication.count({ where: { status: "APPROVED" } }),
      db_default.admissionApplication.count({ where: { status: "REJECTED" } })
    ]);
    return { total, pending, approved, rejected };
  }
  async getPublicClasses() {
    return db_default.class.findMany({
      select: { id: true, name: true, numericLevel: true },
      orderBy: { numericLevel: "asc" }
    });
  }
  async getApplicationsByEmail(email) {
    return db_default.admissionApplication.findMany({
      where: {
        OR: [{ studentEmail: email }, { guardianEmail: email }]
      },
      select: {
        id: true,
        applicantName: true,
        studentEmail: true,
        status: true,
        paymentStatus: true,
        rejectionReason: true,
        createdAt: true,
        targetClass: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async _exists(id) {
    const admission = await db_default.admissionApplication.findUnique({ where: { id } });
    if (!admission) throw new Error("Admission record not found");
    return admission;
  }
  async _audit(userId, action, targetId, meta) {
    try {
      await db_default.auditLog.create({
        data: { userId, action, targetId, meta, timestamp: /* @__PURE__ */ new Date() }
      });
    } catch (err) {
      console.warn("Audit log failed:", err?.message);
    }
  }
  async createStudentFromAdmission(admissionId) {
    return db_default.$transaction(
      async (tx) => {
        const admission = await tx.admissionApplication.findUnique({ where: { id: admissionId } });
        if (!admission) throw new Error("Admission record not found");
        if (admission.studentId) return admission;
        const studentEmail = admission.studentEmail;
        if (!studentEmail) throw new Error("Student email is required to create account");
        let user = await tx.user.findUnique({ where: { email: studentEmail } });
        let tempPassword = null;
        if (!user) {
          tempPassword = (0, import_node_crypto3.randomBytes)(6).toString("hex").toUpperCase();
          const passwordHash = await import_bcryptjs5.default.hash(tempPassword, 10);
          user = await tx.user.create({
            data: {
              name: admission.applicantName,
              email: studentEmail,
              passwordHash,
              role: "STUDENT"
            }
          });
        }
        const sections = await tx.section.findMany({
          where: { classId: admission.targetClassId },
          include: { _count: { select: { students: true } } },
          orderBy: { name: "asc" }
        });
        const section = sections.find((s) => s._count.students < s.maxCapacity);
        if (!section) throw new Error("No available section with capacity for this class");
        const rollAggregate = await tx.student.aggregate({
          where: { sectionId: section.id },
          _max: { rollNumber: true }
        });
        const nextRoll = (rollAggregate._max.rollNumber ?? 0) + 1;
        const studentId = `STD-${(0, import_node_crypto3.randomBytes)(4).toString("hex").toUpperCase()}`;
        let studentProfile = await tx.student.findFirst({ where: { userId: user.id } });
        if (!studentProfile) {
          studentProfile = await tx.student.create({
            data: {
              studentId,
              name: admission.applicantName,
              dob: admission.dob,
              gender: admission.gender,
              bloodGroup: admission.bloodGroup,
              religion: admission.religion,
              address: admission.address,
              photo: admission.photoUrl,
              rollNumber: nextRoll,
              classId: admission.targetClassId,
              sectionId: section.id,
              userId: user.id
            }
          });
        }
        const parentResult = await this._ensureParentFromAdmission(tx, admission);
        if (parentResult && !studentProfile.parentId) {
          studentProfile = await tx.student.update({
            where: { id: studentProfile.id },
            data: { parentId: parentResult.parent.id }
          });
        }
        await tx.admissionApplication.update({
          where: { id: admission.id },
          data: { studentId: studentProfile.id }
        });
        return {
          ...studentProfile,
          __tempPassword: tempPassword,
          __email: studentEmail,
          __guardianName: admission.guardianName,
          __parentTempPassword: parentResult?.tempPassword ?? null,
          __parentEmail: parentResult?.email ?? null
        };
      },
      { isolationLevel: "Serializable" }
    ).then(async (result) => {
      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
      if (result.__tempPassword) {
        mailService.sendStudentCredentials(result.__email, result.name, result.__tempPassword, loginUrl).catch((err) => console.warn("Student welcome email failed:", err?.message));
      }
      if (result.__parentTempPassword) {
        mailService.sendParentCredentials(
          result.__parentEmail,
          result.__guardianName,
          result.name,
          result.__parentTempPassword,
          loginUrl
        ).catch((err) => console.warn("Parent welcome email failed:", err?.message));
      }
      return result;
    });
  }
  // Creates (or reuses) the guardian's User + Parent account and returns
  // it. Reuses an existing parent account when the guardianEmail already
  // has one (multi-child families). Returns null when no guardianEmail.
  async _ensureParentFromAdmission(tx, admission) {
    const guardianEmail = admission.guardianEmail;
    if (!guardianEmail) return null;
    const existingParent = await tx.parent.findFirst({
      where: { user: { email: guardianEmail } }
    });
    if (existingParent) {
      return { parent: existingParent, email: guardianEmail, tempPassword: null };
    }
    let user = await tx.user.findUnique({ where: { email: guardianEmail } });
    let tempPassword = null;
    if (!user) {
      tempPassword = (0, import_node_crypto3.randomBytes)(6).toString("hex").toUpperCase();
      const passwordHash = await import_bcryptjs5.default.hash(tempPassword, 10);
      user = await tx.user.create({
        data: {
          name: admission.guardianName,
          email: guardianEmail,
          passwordHash,
          role: "PARENT"
        }
      });
    }
    const parent = await tx.parent.create({
      data: {
        userId: user.id,
        name: admission.guardianName,
        phone: admission.guardianPhone,
        address: admission.address,
        relation: "Guardian"
      }
    });
    return { parent, email: guardianEmail, tempPassword };
  }
};

// src/config/striPe.ts
var import_stripe = __toESM(require("stripe"));
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {});
var striPe_default = stripe;

// src/modules/admission/admission.controller.ts
var admissionService = new AdmissionService();
var REQUIRED_APPLY_FIELDS = [
  "applicantName",
  "studentEmail",
  "dob",
  "gender",
  "address",
  "guardianName",
  "guardianPhone",
  "guardianEmail",
  "targetClassId"
];
var AdmissionController = class {
  /** Public — no auth required */
  async apply(req, res, next) {
    try {
      const missing = REQUIRED_APPLY_FIELDS.filter((f) => !req.body?.[f]);
      if (missing.length) {
        const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
        err.status = 400;
        throw err;
      }
      const admission = await admissionService.create(req.body);
      sendSuccess(res, admission, "Application submitted successfully", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAll(req, res, next) {
    try {
      const data = await admissionService.findAll(req.query);
      sendSuccess(res, data, "Admissions fetched");
    } catch (err) {
      next(err);
    }
  }
  async findById(req, res, next) {
    try {
      const admission = await admissionService.findById(String(req.params.id));
      sendSuccess(res, admission, "Admission fetched");
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const admission = await admissionService.update(String(req.params.id), req.body);
      sendSuccess(res, admission, "Admission updated");
    } catch (err) {
      next(err);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const admission = await admissionService.updateStatus(
        String(req.params.id),
        req.body,
        req.user.id
      );
      sendSuccess(res, admission, "Admission status updated");
    } catch (err) {
      next(err);
    }
  }
  async convertToStudent(req, res, next) {
    try {
      const student = await admissionService.convertToStudent(req.body);
      sendSuccess(res, student, "Student account created from admission", 201);
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      await admissionService.delete(String(req.params.id), req.user.id);
      sendSuccess(res, null, "Admission deleted");
    } catch (err) {
      next(err);
    }
  }
  async getStats(req, res, next) {
    try {
      const stats = await admissionService.getStats();
      sendSuccess(res, stats, "Stats fetched");
    } catch (err) {
      next(err);
    }
  }
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const result = await uploadToCloudinary(req.file.buffer, "admissions/documents");
      sendSuccess(res, { url: result.secure_url }, "Document uploaded");
    } catch (err) {
      next(err);
    }
  }
  async getPublicClasses(req, res, next) {
    try {
      const classes = await admissionService.getPublicClasses();
      sendSuccess(res, classes, "Classes fetched");
    } catch (err) {
      next(err);
    }
  }
  async createStripeCheckout(req, res, next) {
    try {
      const amount = Number(req.body?.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }
      const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const session = await striPe_default.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: "Admission Fee",
                description: req.body?.targetClassId ? `Class: ${req.body.targetClassId}` : void 0
              }
            },
            quantity: 1
          }
        ],
        success_url: `${frontendUrl}/apply-for-admission?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/apply-for-admission?payment=cancel`,
        metadata: {
          applicantName: req.body?.applicantName ?? "",
          targetClassId: req.body?.targetClassId ?? ""
        }
      });
      sendSuccess(res, { url: session.url, sessionId: session.id }, "Stripe session created");
    } catch (err) {
      next(err);
    }
  }
  async verifyStripeSession(req, res, next) {
    try {
      const sessionId = String(req.query.session_id || "");
      if (!sessionId) throw new Error("Missing session_id");
      const session = await striPe_default.checkout.sessions.retrieve(sessionId);
      const paid = session.payment_status === "paid";
      sendSuccess(res, {
        paid,
        amountTotal: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency,
        sessionId: session.id
      }, "Stripe session verified");
    } catch (err) {
      next(err);
    }
  }
  async getMyApplications(req, res, next) {
    try {
      const applications = await admissionService.getApplicationsByEmail(req.user.email);
      sendSuccess(res, applications, "Your applications fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/admission/admission.routes.ts
var router9 = (0, import_express9.Router)();
var c2 = new AdmissionController();
router9.post("/apply", c2.apply.bind(c2));
router9.get("/classes", c2.getPublicClasses.bind(c2));
router9.post("/stripe/checkout", c2.createStripeCheckout.bind(c2));
router9.get("/stripe/verify", c2.verifyStripeSession.bind(c2));
router9.post(
  "/upload-document",
  upload.single("document"),
  c2.uploadDocument.bind(c2)
);
router9.get("/my-applications", authenticate, c2.getMyApplications.bind(c2));
router9.use(authenticate, authorizeRoles("SCHOOL_ADMIN"));
router9.get("/stats", c2.getStats.bind(c2));
router9.post("/convert-to-student", c2.convertToStudent.bind(c2));
router9.patch("/:id/status", c2.updateStatus.bind(c2));
router9.get("/", c2.findAll.bind(c2));
router9.post("/", c2.apply.bind(c2));
router9.get("/:id", c2.findById.bind(c2));
router9.patch("/:id", c2.update.bind(c2));
router9.delete("/:id", c2.delete.bind(c2));
var admission_routes_default = router9;

// src/modules/fee/router.ts
var import_express10 = require("express");

// src/modules/fee/fee.service.ts
init_db();
init_pagination_util();
function deriveMonthYear(date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
function deriveAcademicYear(year, month) {
  if (month >= 7) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}
function monthRange(month) {
  const start = /* @__PURE__ */ new Date(`${month}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
}
var createfee = async (dto) => {
  if (dto.studentId) {
    const student = await db_default.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true }
    });
    if (!student) throw new Error("Student not found");
  }
  const dueDate = new Date(dto.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);
  return db_default.feeStructure.create({
    data: {
      studentId: dto.studentId,
      classId: dto.classId,
      feeType: dto.type,
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      dueDate,
      dueDay: dto.dueDay,
      year,
      month,
      academicYear,
      status: "PENDING",
      Paidamount: 0
    },
    select: {
      id: true,
      studentId: true,
      classId: true,
      feeType: true,
      amount: true,
      dueDate: true,
      status: true,
      student: { select: { user: { select: { name: true, email: true } } } }
    }
  });
};
var bulkcreate = async (dto) => {
  const students = await db_default.student.findMany({
    where: { classId: dto.classId },
    select: { id: true }
  });
  const dueDate = new Date(dto.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);
  const fees = students.map((student) => ({
    studentId: student.id,
    classId: dto.classId,
    feeType: dto.type,
    title: dto.title,
    description: dto.description,
    amount: dto.amount,
    dueDate,
    dueDay: dueDate.getDate(),
    year,
    month,
    academicYear,
    status: "PENDING",
    Paidamount: 0
  }));
  const result = await db_default.feeStructure.createMany({
    data: fees,
    skipDuplicates: true
  });
  return { created: result.count, skippedExisting: students.length - result.count };
};
var findAll = async (dto) => {
  const { page = "1", limit = "10", studentId, classId, type, status, month } = dto;
  const where = {
    ...studentId && { studentId },
    ...classId && { classId },
    ...type && { feeType: type },
    ...status && { status }
  };
  if (month) {
    const { start, end } = monthRange(month);
    where.dueDate = { gte: start, lt: end };
  }
  const { skip, take, meta } = await paginate(
    db_default.feeStructure,
    where,
    parseInt(page),
    parseInt(limit)
  );
  const fees = await db_default.feeStructure.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      feeType: true,
      title: true,
      amount: true,
      Paidamount: true,
      status: true,
      dueDate: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: { select: { name: true, email: true } },
          class: { select: { name: true } }
        }
      },
      payments: { select: { id: true, amount: true, method: true, createdAt: true } }
    },
    orderBy: { dueDate: "asc" }
  });
  return { data: fees, meta };
};
var findByid = async (id) => {
  const fee = await db_default.feeStructure.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { name: true } }
        }
      },
      payments: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!fee) throw new Error("Fee not found");
  return { ...fee, payments: fee.payments ?? [] };
};
var updateFee = async (id, dto) => {
  await _exists(id);
  return db_default.feeStructure.update({
    where: { id },
    data: {
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      status: dto.status,
      ...dto.dueDate && { dueDate: new Date(dto.dueDate) }
    },
    include: { payments: true }
  });
};
var deleteFee = async (id) => {
  await _exists(id);
  const paymentCount = await db_default.payment.count({ where: { feeStructureId: id } });
  if (paymentCount > 0) {
    throw {
      status: 409,
      message: "Cannot delete fee with existing payments; consider marking it as WAIVED instead."
    };
  }
  return db_default.feeStructure.delete({ where: { id } });
};
var recordPayment = async (dto, actorUserId) => {
  return db_default.$transaction(
    async (tx) => {
      const fee = await tx.feeStructure.findUnique({ where: { id: dto.feeId } });
      if (!fee) throw new Error("Fee not found");
      if (fee.status === "PAID") throw new Error("Fee is already paid");
      if (!fee.studentId) throw new Error("Fee has no associated student");
      const totalPaid = fee.Paidamount + dto.amountPaid;
      if (totalPaid > fee.amount) throw new Error("Payment exceeds fee amount");
      let invoice = await tx.invoice.findFirst({ where: { feeStructureId: fee.id } });
      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            studentId: fee.studentId,
            feeStructureId: fee.id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            year: fee.year,
            month: fee.month,
            status: "PENDING"
          }
        });
      }
      const newStatus = totalPaid === fee.amount ? "PAID" : totalPaid > 0 ? "PARTIAL" : fee.status;
      const transactionId = dto.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const payment = await tx.payment.create({
        data: {
          feeStructureId: dto.feeId,
          amount: dto.amountPaid,
          method: dto.method,
          status: "PAID",
          transactionId,
          note: dto.note ?? void 0,
          invoiceId: invoice.id,
          studentId: fee.studentId
        }
      });
      await tx.feeStructure.update({
        where: { id: dto.feeId },
        data: { Paidamount: totalPaid, status: newStatus }
      });
      if (newStatus === "PAID") {
        await tx.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
      }
      tx.auditLog.create({
        data: {
          userId: actorUserId,
          action: "FEE_PAYMENT_RECORDED",
          targetId: fee.id,
          metadata: { amount: dto.amountPaid, method: dto.method, newStatus, transactionId }
        }
      }).catch((err) => console.warn("Audit log failed:", err?.message));
      return payment;
    },
    { isolationLevel: "Serializable" }
  );
};
var recordCashPayment = async (dto, actorUserId) => {
  const student = await db_default.student.findUnique({
    where: { id: dto.studentId },
    select: { id: true, classId: true }
  });
  if (!student) throw new Error("Student not found");
  const now = /* @__PURE__ */ new Date();
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : now;
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);
  return db_default.$transaction(
    async (tx) => {
      let fee = await tx.feeStructure.findFirst({
        where: {
          studentId: student.id,
          feeType: dto.type,
          year,
          month,
          academicYear,
          status: { in: ["PENDING", "PARTIAL"] }
        }
      });
      const isNewFee = !fee;
      if (!fee) {
        fee = await tx.feeStructure.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            feeType: dto.type,
            amount: dto.amountPaid,
            dueDate,
            dueDay: dueDate.getDate(),
            year,
            month,
            academicYear,
            status: "PENDING",
            Paidamount: 0
          }
        });
      }
      const totalPaid = fee.Paidamount + dto.amountPaid;
      if (totalPaid > fee.amount) {
        throw new Error("Payment exceeds outstanding fee amount");
      }
      const newStatus = totalPaid === fee.amount ? "PAID" : "PARTIAL";
      const transactionId = dto.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      let invoice = await tx.invoice.findFirst({ where: { feeStructureId: fee.id } });
      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            studentId: student.id,
            feeStructureId: fee.id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            year,
            month,
            status: newStatus
          }
        });
      } else {
        invoice = await tx.invoice.update({ where: { id: invoice.id }, data: { status: newStatus } });
      }
      const payment = await tx.payment.create({
        data: {
          feeStructureId: fee.id,
          invoiceId: invoice.id,
          studentId: student.id,
          amount: dto.amountPaid,
          method: "CASH",
          status: "PAID",
          paidAt: now,
          transactionId,
          note: dto.note ?? void 0
        }
      });
      await tx.feeStructure.update({
        where: { id: fee.id },
        data: { Paidamount: totalPaid, status: newStatus }
      });
      tx.auditLog.create({
        data: {
          userId: actorUserId,
          action: "FEE_CASH_PAYMENT",
          targetId: fee.id,
          metadata: { amount: dto.amountPaid, isNewFee }
        }
      }).catch((err) => console.warn("Audit log failed:", err?.message));
      return { fee, invoice, payment };
    },
    { isolationLevel: "Serializable" }
  );
};
var getstudentFeeSummary = async (studentId) => {
  const [totals, overDue] = await Promise.all([
    db_default.feeStructure.aggregate({
      where: { studentId },
      _sum: { amount: true, Paidamount: true }
    }),
    db_default.feeStructure.count({
      where: { studentId, status: "PENDING", dueDate: { lt: /* @__PURE__ */ new Date() } }
    })
  ]);
  const totalFees = totals._sum.amount ?? 0;
  const totalPaid = totals._sum.Paidamount ?? 0;
  return { totalFees, totalPaid, outstanding: totalFees - totalPaid, overDue };
};
var getCollectionReport = async (month, type) => {
  const { start, end } = monthRange(month);
  const baseWhere = {
    createdAt: { gte: start, lt: end },
    ...type ? { feeStructure: { feeType: type } } : {}
  };
  const [totalAgg, byMethodGroups, byTypeGroups] = await Promise.all([
    db_default.payment.aggregate({ where: baseWhere, _sum: { amount: true }, _count: true }),
    db_default.payment.groupBy({
      by: ["method"],
      where: baseWhere,
      _sum: { amount: true }
    }),
    // feeType lives on FeeStructure, not Payment, so it can't be grouped
    // directly — resolve the small, fixed set of fee types in parallel
    // aggregate queries instead of pulling every payment row into JS.
    db_default.feeStructure.findMany({ where: {}, select: { feeType: true }, distinct: ["feeType"] }).then(
      (types) => Promise.all(
        types.map(async ({ feeType }) => {
          const agg = await db_default.payment.aggregate({
            where: { ...baseWhere, feeStructure: { feeType } },
            _sum: { amount: true }
          });
          return [feeType, agg._sum.amount ?? 0];
        })
      )
    )
  ]);
  const byMethod = Object.fromEntries(
    byMethodGroups.map((g) => [g.method === "STRIPE" ? "ONLINE" : "OFFLINE", g._sum.amount ?? 0])
  );
  const byType = Object.fromEntries(byTypeGroups.filter(([, sum]) => sum > 0));
  return {
    month,
    totalCollected: totalAgg._sum.amount ?? 0,
    totalTransactions: totalAgg._count,
    byType,
    byMethod
  };
};
var getFeeSummary = async (month) => {
  const where = {};
  if (month) {
    const { start, end } = monthRange(month);
    where.dueDate = { gte: start, lt: end };
  }
  const [totals, pendingCount, overdueCount] = await Promise.all([
    db_default.feeStructure.aggregate({ where, _sum: { amount: true, Paidamount: true } }),
    db_default.feeStructure.count({ where: { ...where, status: "PENDING" } }),
    db_default.feeStructure.count({ where: { ...where, status: "PENDING", dueDate: { lt: /* @__PURE__ */ new Date() } } })
  ]);
  const totalAmount = totals._sum.amount ?? 0;
  const totalPaid = totals._sum.Paidamount ?? 0;
  return {
    totalAmount,
    totalPaid,
    outstanding: totalAmount - totalPaid,
    pendingCount,
    overdueCount,
    overDue: overdueCount
  };
};
var getOverdueFees = async (dto) => {
  const { page = "1", limit = "10", classId } = dto;
  const where = {
    status: { in: ["PENDING", "PARTIAL"] },
    dueDate: { lt: /* @__PURE__ */ new Date() },
    ...classId && { classId }
  };
  const { skip, take, meta } = await paginate(
    db_default.feeStructure,
    where,
    parseInt(page),
    parseInt(limit)
  );
  const fees = await db_default.feeStructure.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      feeType: true,
      amount: true,
      Paidamount: true,
      dueDate: true,
      student: {
        select: { id: true, rollNumber: true, user: { select: { name: true } } }
      }
    },
    orderBy: { dueDate: "asc" }
  });
  return { data: fees, meta };
};
var _exists = async (id) => {
  const fee = await db_default.feeStructure.findUnique({ where: { id }, select: { id: true } });
  if (!fee) throw new Error("Fee record not found");
  return fee;
};
var getAllPayments = async (dto) => {
  const page = Number(dto.page);
  const limit = Number(dto.limit);
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;
  const skip = (safePage - 1) * safeLimit;
  const take = safeLimit;
  const where = {};
  if (dto.method && ["STRIPE", "CASH"].includes(dto.method)) {
    where.method = dto.method;
  }
  if (dto.status && ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(dto.status)) {
    where.status = dto.status;
  }
  if (dto.month) {
    const monthStr = String(dto.month).trim();
    const monthRegex = /^\d{4}-\d{2}$/;
    if (monthRegex.test(monthStr)) {
      const [yearStr, monthNumStr] = monthStr.split("-");
      const year = Number(yearStr);
      const monthNum = Number(monthNumStr);
      if (year >= 2e3 && year <= 2100 && monthNum >= 1 && monthNum <= 12) {
        const start = new Date(Date.UTC(year, monthNum - 1, 1));
        const end = new Date(Date.UTC(year, monthNum, 1));
        where.createdAt = { gte: start, lt: end };
      }
    }
  }
  const [payments, total] = await Promise.all([
    db_default.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionId: true,
        note: true,
        paidAt: true,
        createdAt: true,
        student: { select: { id: true, rollNumber: true, user: { select: { name: true, email: true } } } },
        feeStructure: { select: { id: true, feeType: true, title: true, amount: true } }
      }
    }),
    db_default.payment.count({ where })
  ]);
  return {
    data: payments,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};
var getMonthlyAnalytics = async (year) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [byMonth, byMethodYear, typeBreakdown] = await Promise.all([
    Promise.all(
      months.map(async (m) => {
        const start = new Date(year, m - 1, 1);
        const end = new Date(year, m, 1);
        const agg = await db_default.payment.aggregate({
          where: { createdAt: { gte: start, lt: end }, status: "PAID" },
          _sum: { amount: true },
          _count: { id: true }
        });
        return { month: m, total: agg._sum.amount ?? 0, count: agg._count.id ?? 0 };
      })
    ),
    db_default.payment.groupBy({
      by: ["method"],
      where: { createdAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }, status: "PAID" },
      _sum: { amount: true }
    }),
    db_default.feeStructure.groupBy({
      by: ["feeType"],
      _sum: { amount: true, Paidamount: true }
    })
  ]);
  return {
    year,
    byMonth,
    byMethod: Object.fromEntries(byMethodYear.map((g) => [g.method, g._sum.amount ?? 0])),
    byType: Object.fromEntries(typeBreakdown.map((t) => [t.feeType, { amount: t._sum.amount ?? 0, paid: t._sum.Paidamount ?? 0 }]))
  };
};

// src/modules/fee/fee.controller.ts
var FeesController = class {
  async create(req, res, next) {
    try {
      const fee = await createfee(req.body);
      sendSuccess(res, fee, "Fee created", 201);
    } catch (err) {
      next(err);
    }
  }
  async bulkCreate(req, res, next) {
    try {
      const result = await bulkcreate(req.body);
      sendSuccess(res, result, `Fees assigned to ${result.created} students`, 201);
    } catch (err) {
      next(err);
    }
  }
  async findAll(req, res, next) {
    try {
      const data = await findAll(req.query);
      sendSuccess(res, data, "Fees fetched");
    } catch (err) {
      next(err);
    }
  }
  async findById(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      const fee = await findByid(idStr);
      if (req.user?.role === "STUDENT" && fee.studentId !== req.user.studentId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      sendSuccess(res, fee, "Fee fetched");
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      const fee = await updateFee(idStr, req.body);
      sendSuccess(res, fee, "Fee updated");
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      await deleteFee(idStr);
      sendSuccess(res, null, "Fee deleted");
    } catch (err) {
      next(err);
    }
  }
  async recordPayment(req, res, next) {
    try {
      if (!req.user?.id) throw new Error("Authenticated user not found on request");
      const payment = await recordPayment(req.body, req.user.id);
      sendSuccess(res, payment, "Payment recorded", 201);
    } catch (err) {
      next(err);
    }
  }
  async recordCashPayment(req, res, next) {
    try {
      if (!req.user?.id) throw new Error("Authenticated user not found on request");
      const payment = await recordCashPayment(req.body, req.user.id);
      sendSuccess(res, payment, "Cash payment recorded", 201);
    } catch (err) {
      next(err);
    }
  }
  async getStudentSummary(req, res, next) {
    try {
      let { studentId } = req.params;
      const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;
      if (!studentIdStr) throw new Error("studentId param required");
      if (req.user?.role === "STUDENT" && req.user.studentId !== studentIdStr) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const data = await getstudentFeeSummary(studentIdStr);
      sendSuccess(res, data, "Fee summary fetched");
    } catch (err) {
      next(err);
    }
  }
  async getCollectionReport(req, res, next) {
    try {
      let { month, type } = req.query;
      const monthStr = Array.isArray(month) ? month[0] : month;
      const typeStr = type ? Array.isArray(type) ? type[0] : type : void 0;
      if (!monthStr) throw new Error("month query param required (e.g. 2024-09)");
      const data = await getCollectionReport(monthStr, typeStr);
      sendSuccess(res, data, "Collection report fetched");
    } catch (err) {
      next(err);
    }
  }
  async getSummary(req, res, next) {
    try {
      let { month } = req.query;
      const monthStr = month ? Array.isArray(month) ? month[0] : month : void 0;
      const data = await getFeeSummary(monthStr);
      sendSuccess(res, data, "Fee summary fetched");
    } catch (err) {
      next(err);
    }
  }
  async getOverdueFees(req, res, next) {
    try {
      const data = await getOverdueFees(req.query);
      sendSuccess(res, data, "Overdue fees fetched");
    } catch (err) {
      next(err);
    }
  }
  async getMyFees(req, res, next) {
    try {
      if (!req.user?.studentId) {
        throw new Error("Student ID not found in token");
      }
      const data = await getstudentFeeSummary(req.user.studentId);
      sendSuccess(res, data, "Your fees fetched");
    } catch (err) {
      next(err);
    }
  }
  async getTransactions(req, res, next) {
    try {
      const data = await getAllPayments(req.query);
      sendSuccess(res, data, "Transactions fetched");
    } catch (err) {
      next(err);
    }
  }
  async getMonthlyAnalytics(req, res, next) {
    try {
      const yearStr = req.query.year;
      const year = yearStr ? parseInt(yearStr) : (/* @__PURE__ */ new Date()).getFullYear();
      const data = await getMonthlyAnalytics(year);
      sendSuccess(res, data, "Analytics fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/fee/router.ts
var router10 = (0, import_express10.Router)();
var c3 = new FeesController();
router10.use(authenticate);
router10.get("/my-fees", authorizeRoles("STUDENT"), c3.getMyFees.bind(c3));
router10.get("/report/collection", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN", "ADMIN"), c3.getCollectionReport.bind(c3));
router10.get("/report/overdue", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN", "ADMIN"), c3.getOverdueFees.bind(c3));
router10.get("/summary", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN", "ADMIN"), c3.getSummary.bind(c3));
router10.get("/transactions", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN"), c3.getTransactions.bind(c3));
router10.get("/analytics/monthly", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN"), c3.getMonthlyAnalytics.bind(c3));
router10.get("/student/:studentId", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN", "STUDENT"), c3.getStudentSummary.bind(c3));
router10.post("/", authorizeRoles("ACCOUNTANT"), c3.create.bind(c3));
router10.post("/bulk", authorizeRoles("ACCOUNTANT"), c3.bulkCreate.bind(c3));
router10.get("/", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN"), c3.findAll.bind(c3));
router10.get("/:id", authorizeRoles("ACCOUNTANT", "SCHOOL_ADMIN", "STUDENT"), c3.findById.bind(c3));
router10.patch("/:id", authorizeRoles("ACCOUNTANT"), c3.update.bind(c3));
router10.delete("/:id", authorizeRoles("ACCOUNTANT"), c3.delete.bind(c3));
router10.patch("/:id/pay", authorizeRoles("ACCOUNTANT"), c3.recordPayment.bind(c3));
router10.post("/cash", authorizeRoles("ACCOUNTANT"), c3.recordCashPayment.bind(c3));
var router_default = router10;

// src/modules/teachingApplication/teachingApplication.routes.ts
var import_express11 = require("express");

// src/modules/teachingApplication/teachingApplication.service.ts
init_db();
var import_bcryptjs6 = __toESM(require("bcryptjs"));
var import_node_crypto4 = require("crypto");
var APPLICATION_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  dob: true,
  address: true,
  designation: true,
  department: true,
  qualification: true,
  experience: true,
  subjectSpecialization: true,
  expectedSalary: true,
  resumeUrl: true,
  coverLetter: true,
  status: true,
  reviewedAt: true,
  rejectionReason: true,
  createdAt: true
};
var applyForTeaching = async (dto) => {
  const [pendingApplication, activeTeacher] = await Promise.all([
    db_default.teachingApplication.findFirst({ where: { email: dto.email, status: "PENDING" }, select: { id: true } }),
    db_default.teacher.findFirst({ where: { email: dto.email, isActive: true }, select: { id: true } })
  ]);
  if (pendingApplication) throw new Error("An application with this email is already pending");
  if (activeTeacher) throw new Error("This email already belongs to an active teacher account");
  return db_default.teachingApplication.create({
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      dob: new Date(dto.dob),
      address: dto.address,
      designation: dto.designation,
      department: dto.department,
      qualification: dto.qualification,
      experience: dto.experience,
      subjectSpecialization: dto.subjectSpecialization,
      expectedSalary: dto.expectedSalary,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter
    },
    select: APPLICATION_SELECT
  });
};
var listTeachingApplications = async (query = {}) => {
  const page = query.page ?? 1;
  const pageSize = Math.min(query.pageSize ?? 20, 100);
  const where = {
    ...query.status && { status: query.status },
    ...query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } }
      ]
    }
  };
  const [total, data] = await Promise.all([
    db_default.teachingApplication.count({ where }),
    db_default.teachingApplication.findMany({
      where,
      select: APPLICATION_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};
var getTeachingApplicationById = async (id) => {
  const application = await db_default.teachingApplication.findUnique({ where: { id }, select: APPLICATION_SELECT });
  if (!application) throw { status: 404, message: "Application not found" };
  return application;
};
var updateTeachingApplicationStatus = async (id, dto) => {
  const application = await db_default.teachingApplication.findUnique({ where: { id } });
  if (!application) throw { status: 404, message: "Application not found" };
  if (dto.status === "REJECTED" && !dto.rejectionReason) {
    throw new Error("A rejection reason is required");
  }
  if (dto.status !== "APPROVED" || application.status === "APPROVED") {
    return db_default.teachingApplication.update({
      where: { id },
      data: { status: dto.status, rejectionReason: dto.rejectionReason, reviewedAt: /* @__PURE__ */ new Date() },
      select: APPLICATION_SELECT
    });
  }
  let tempPassword = null;
  const result = await db_default.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: application.email }, select: { id: true, role: true } });
    if (!user) {
      tempPassword = (0, import_node_crypto4.randomBytes)(6).toString("base64url");
      const passwordHash = await import_bcryptjs6.default.hash(tempPassword, 10);
      user = await tx.user.create({
        data: { name: application.name, email: application.email, passwordHash, role: "TEACHER" },
        select: { id: true, role: true }
      });
    } else if (user.role !== "TEACHER") {
      user = await tx.user.update({ where: { id: user.id }, data: { role: "TEACHER" }, select: { id: true, role: true } });
    }
    let teacher = await tx.teacher.findFirst({ where: { userId: user.id }, select: { id: true } });
    if (!teacher) {
      const employeeId = await _generateUniqueEmployeeId(tx);
      teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          name: application.name,
          email: application.email,
          phone: application.phone,
          gender: application.gender,
          address: application.address,
          designation: application.designation,
          department: application.department,
          qualification: application.qualification,
          experience: application.experience,
          subjectSpecialization: application.subjectSpecialization,
          salary: application.expectedSalary,
          dateOfBirth: application.dob,
          joiningDate: /* @__PURE__ */ new Date(),
          isActive: true
        },
        select: { id: true }
      });
    }
    const updatedApplication = await tx.teachingApplication.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: /* @__PURE__ */ new Date(), rejectionReason: null },
      select: APPLICATION_SELECT
    });
    return { application: updatedApplication, teacherId: teacher.id, isNewAccount: !!tempPassword };
  });
  return { ...result, tempPassword };
};
async function _generateUniqueEmployeeId(tx) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `TCH-${(0, import_node_crypto4.randomBytes)(3).toString("hex")}`.toUpperCase();
    const clash = await tx.teacher.findFirst({ where: { employeeId: candidate }, select: { id: true } });
    if (!clash) return candidate;
  }
  throw new Error("Could not generate a unique employee ID, please retry");
}

// src/modules/teachingApplication/teachingApplication.controller.ts
var TeachingApplicationController = class {
  // ── PUBLIC: job application form submission, no auth required ─────
  async apply(req, res, next) {
    try {
      const application = await applyForTeaching(req.body);
      sendSuccess(res, application, "Application submitted", 201);
    } catch (err) {
      next(err);
    }
  }
  // ── HR: paginated / filterable applicant list 
  async findAll(req, res, next) {
    try {
      const { status, search, page, pageSize } = req.query;
      const result = await listTeachingApplications({
        status,
        search,
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, result, "Applications fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── HR: single application 
  async findById(req, res, next) {
    try {
      const application = await getTeachingApplicationById(req.params.id);
      sendSuccess(res, application, "Application fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── HR: approve or reject 
  async updateStatus(req, res, next) {
    try {
      const result = await updateTeachingApplicationStatus(
        req.params.id,
        req.body
      );
      sendSuccess(res, result, "Application status updated");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/teachingApplication/teachingApplication.routes.ts
var router11 = (0, import_express11.Router)();
var c4 = new TeachingApplicationController();
router11.post("/apply", c4.apply.bind(c4));
router11.use(authenticate);
router11.get("/", authorizeRoles("HR", "SCHOOL_ADMIN"), c4.findAll.bind(c4));
router11.get("/:id", authorizeRoles("HR", "SCHOOL_ADMIN"), c4.findById.bind(c4));
router11.patch("/:id/status", authorizeRoles("HR", "SCHOOL_ADMIN"), c4.updateStatus.bind(c4));
var teachingApplication_routes_default = router11;

// src/modules/notice/notice.route.ts
var import_express12 = require("express");

// src/modules/notice/notice.service.ts
init_db();
init_pagination_util();
var import_client3 = require("@prisma/client");
var ALL_STAFF_ROLES = [
  import_client3.Role.SUPER_ADMIN,
  import_client3.Role.SCHOOL_ADMIN,
  import_client3.Role.ACCOUNTANT,
  import_client3.Role.EXAM_CONTROLLER,
  import_client3.Role.HR,
  import_client3.Role.TEACHER
];
var audienceToUserRoles = {
  TEACHERS: [import_client3.Role.TEACHER],
  STAFF: ALL_STAFF_ROLES,
  SUPER_ADMIN: [import_client3.Role.SUPER_ADMIN],
  SCHOOL_ADMIN: [import_client3.Role.SCHOOL_ADMIN],
  ACCOUNTANT: [import_client3.Role.ACCOUNTANT],
  EXAM_CONTROLLER: [import_client3.Role.EXAM_CONTROLLER],
  HR: [import_client3.Role.HR]
};
async function resolveRecipients(audience, sectionIds) {
  const studentWhere = sectionIds?.length ? { sectionId: { in: sectionIds } } : {};
  let studentIds = [];
  let parentIds = [];
  let userIds = [];
  if (audience === "STUDENTS" || audience === "PARENTS" || audience === "ALL") {
    const students = await db_default.student.findMany({
      where: studentWhere,
      select: { id: true, parentId: true }
    });
    if (audience === "STUDENTS" || audience === "ALL") {
      studentIds = students.map((s) => s.id);
    }
    if (audience === "PARENTS" || audience === "ALL") {
      parentIds = [...new Set(students.map((s) => s.parentId).filter((id) => !!id))];
    }
  }
  const roleTargets = audience === "ALL" ? ALL_STAFF_ROLES : audienceToUserRoles[audience];
  if (roleTargets?.length) {
    const users = await db_default.user.findMany({
      where: { role: { in: roleTargets } },
      select: { id: true }
    });
    userIds = users.map((u) => u.id);
  }
  return { studentIds, parentIds, userIds };
}
var createNotice = async (dto, authorId) => {
  const { studentIds, parentIds, userIds } = await resolveRecipients(dto.audience, dto.sectionIds);
  const notice = await db_default.$transaction(async (tx) => {
    const created = await tx.notice.create({
      data: {
        title: dto.title,
        content: dto.content,
        audience: dto.audience,
        priority: dto.priority || "NORMAL",
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : /* @__PURE__ */ new Date(),
        authorId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : void 0,
        attachmentUrl: dto.attachmentUrl,
        isActive: true
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    if (dto.sectionIds?.length) {
      await tx.noticeSectionTarget.createMany({
        data: dto.sectionIds.map((sectionId) => ({ noticeId: created.id, sectionId })),
        skipDuplicates: true
      });
    }
    if (studentIds.length || parentIds.length || userIds.length) {
      await tx.noticeRecipient.createMany({
        data: [
          ...studentIds.map((studentId) => ({ noticeId: created.id, studentId })),
          ...parentIds.map((parentId) => ({ noticeId: created.id, parentId })),
          ...userIds.map((userId) => ({ noticeId: created.id, userId }))
        ],
        skipDuplicates: true
      });
    }
    return created;
  });
  return notice;
};
var findAll2 = async (query) => {
  const { page = "1", limit = "10", search, audience, priority, isActive } = query;
  const where = {
    ...audience && { audience },
    ...priority && { priority },
    ...isActive !== void 0 && { isActive: isActive === "true" },
    ...search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ]
    }
  };
  const { skip, take, meta } = await paginate(
    db_default.notice,
    where,
    parseInt(page, 10),
    parseInt(limit, 10)
  );
  const notices = await db_default.notice.findMany({
    where,
    skip,
    take,
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }]
  });
  return { data: notices, meta };
};
var findMyNotices = async (opts) => {
  if (!opts.studentId && !opts.parentId && !opts.userId) {
    throw new Error("studentId, parentId, or userId is required");
  }
  const now = /* @__PURE__ */ new Date();
  const recipientRows = await db_default.noticeRecipient.findMany({
    where: {
      ...opts.studentId && { studentId: opts.studentId },
      ...opts.parentId && { parentId: opts.parentId },
      ...opts.userId && { userId: opts.userId },
      notice: {
        isActive: true,
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }]
      }
    },
    include: {
      notice: {
        include: {
          author: { select: { id: true, name: true, email: true, role: true } }
        }
      }
    },
    orderBy: [{ notice: { priority: "desc" } }, { notice: { publishedAt: "desc" } }]
  });
  return recipientRows.map((r) => ({
    ...r.notice,
    isRead: r.isRead,
    readAt: r.readAt,
    recipientId: r.id
  }));
};
var markAsRead = async (recipientId, ownerId) => {
  const recipient = await db_default.noticeRecipient.findUnique({ where: { id: recipientId } });
  if (!recipient) throw new Error("Notice recipient record not found");
  const isOwner = recipient.studentId === ownerId || recipient.parentId === ownerId || recipient.userId === ownerId;
  if (!isOwner) {
    throw { status: 403, message: "Not your notice" };
  }
  return db_default.noticeRecipient.update({
    where: { id: recipientId },
    data: { isRead: true, readAt: /* @__PURE__ */ new Date() }
  });
};
var findById = async (id) => {
  const notice = await db_default.notice.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  if (!notice) {
    throw new Error("Notice not found");
  }
  return notice;
};
var update = async (dto, id) => {
  await findById(id);
  return db_default.notice.update({
    where: { id },
    data: {
      ...dto,
      ...dto.publishedAt && { publishedAt: new Date(dto.publishedAt) },
      ...dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  });
};
var deleteNotice = async (id) => {
  await findById(id);
  return db_default.notice.delete({ where: { id } });
};
var toggleActive = async (id) => {
  const notice = await findById(id);
  return db_default.notice.update({
    where: { id },
    data: { isActive: !notice.isActive }
  });
};
var getFeedForUser = async (opts) => {
  const { role, userId } = opts;
  if (ALL_STAFF_ROLES.includes(role)) {
    return findMyNotices({ userId });
  }
  if (role === import_client3.Role.STUDENT || role === "STUDENT") {
    const student = await db_default.student.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (student) {
      return findMyNotices({ studentId: student.id });
    }
  }
  if (role === import_client3.Role.PARENT || role === "PARENT") {
    const parent = await db_default.parent.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (parent) {
      return findMyNotices({ parentId: parent.id });
    }
  }
  return [];
};

// src/modules/notice/notice.controller.ts
var NoticeController = class {
  async create(req, res, next) {
    try {
      const notice = await createNotice(req.body, req.user.id);
      sendSuccess(res, notice, "Notice created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAll(req, res, next) {
    try {
      const data = await findAll2(req.query);
      sendSuccess(res, data, "Notices fetched");
    } catch (err) {
      next(err);
    }
  }
  /**
   * Authenticated user sees only the notices actually created for them —
   * backed by their own NoticeRecipient rows now, not a broad role match.
   * FIX: this used to call a getFeedForUser that didn't exist in
   * notice.service.ts at all; that function is added there now.
   */
  async feed(req, res, next) {
    try {
      const notices = await getFeedForUser({ role: req.user.role, userId: req.user.id });
      sendSuccess(res, notices, "Notices fetched");
    } catch (err) {
      next(err);
    }
  }
  /** Mark any actor's personal notice recipient row as read — ownership
   * is enforced inside markAsRead (student/parent/staff userId all
   * checked there), so no role restriction is needed at the route level. */
  async markRead(req, res, next) {
    try {
      const { recipientId } = req.params;
      const recipient = await markAsRead(recipientId, req.user.id);
      sendSuccess(res, recipient, "Notice marked as read");
    } catch (err) {
      next(err);
    }
  }
  async findById(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      const notice = await findById(idStr);
      sendSuccess(res, notice, "Notice fetched");
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      const notice = await update(req.body, idStr);
      sendSuccess(res, notice, "Notice updated");
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      await deleteNotice(idStr);
      sendSuccess(res, null, "Notice deleted");
    } catch (err) {
      next(err);
    }
  }
  async toggleActive(req, res, next) {
    try {
      let { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error("id param required");
      const notice = await toggleActive(idStr);
      sendSuccess(res, notice, `Notice ${notice.isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/notice/notice.route.ts
var router12 = (0, import_express12.Router)();
var c5 = new NoticeController();
router12.use(authenticate);
router12.get("/feed", c5.feed.bind(c5));
router12.patch("/read/:recipientId", c5.markRead.bind(c5));
router12.post("/", authorizeRoles("SCHOOL_ADMIN"), c5.create.bind(c5));
router12.get("/", authorizeRoles("SCHOOL_ADMIN"), c5.findAll.bind(c5));
router12.get("/:id", authorizeRoles("SCHOOL_ADMIN"), c5.findById.bind(c5));
router12.patch("/:id", authorizeRoles("SCHOOL_ADMIN"), c5.update.bind(c5));
router12.delete("/:id", authorizeRoles("SCHOOL_ADMIN"), c5.delete.bind(c5));
router12.patch("/:id/toggle", authorizeRoles("SCHOOL_ADMIN"), c5.toggleActive.bind(c5));
var notice_route_default = router12;

// src/modules/timetable/timetable.routes.ts
var import_express13 = require("express");

// src/modules/timetable/timetable.service.ts
init_db();
var SLOT_SELECT = {
  id: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  roomNumber: true,
  class: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: {
    select: {
      id: true,
      employeeId: true,
      user: { select: { name: true } }
    }
  }
};
var CACHE_TTL_MS = 3e4;
var weeklyViewCache = /* @__PURE__ */ new Map();
function cacheGet(key) {
  const entry = weeklyViewCache.get(key);
  if (!entry) return void 0;
  if (Date.now() > entry.expiresAt) {
    weeklyViewCache.delete(key);
    return void 0;
  }
  return entry.value;
}
function cacheSet(key, value) {
  weeklyViewCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}
function cacheClearForClass(classId) {
  weeklyViewCache.delete(`class:${classId}`);
}
function cacheClearForTeacher(teacherId) {
  weeklyViewCache.delete(`teacher:${teacherId}`);
}
function cacheClearAll() {
  weeklyViewCache.clear();
}
var createSlot = async (dto) => {
  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber } = dto;
  const [cls, subject, teacher, section] = await Promise.all([
    db_default.class.findUnique({ where: { id: classId }, select: { id: true } }),
    db_default.subject.findUnique({ where: { id: subjectId }, select: { id: true } }),
    db_default.teacher.findUnique({ where: { id: teacherId }, select: { id: true } }),
    db_default.section.findFirst({ where: { classId }, orderBy: { name: "asc" }, select: { id: true } })
  ]);
  if (!cls) throw new Error("Class not found");
  if (!subject) throw new Error("Subject not found");
  if (!teacher) throw new Error("Teacher not found");
  if (!section) throw new Error("No section found for this class");
  await _checkConflicts({ classId, teacherId, dayOfWeek, startTime, endTime });
  try {
    const slot = await db_default.timetable.create({
      data: { classId, sectionId: section.id, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber },
      select: SLOT_SELECT
    });
    cacheClearForClass(classId);
    cacheClearForTeacher(teacherId);
    return slot;
  } catch (err) {
    if (err?.code === "P2002") {
      throw new Error("Schedule conflict: the class or teacher already has a slot during this time");
    }
    throw err;
  }
};
var bulkCreate = async (dto) => {
  const classExists = await db_default.class.findUnique({ where: { id: dto.classId }, select: { id: true } });
  if (!classExists) throw new Error("Class not found");
  const section = await db_default.section.findFirst({
    where: { classId: dto.classId },
    orderBy: { name: "asc" },
    select: { id: true }
  });
  if (!section) throw new Error("No section found for this class");
  const subjectIds = [...new Set(dto.slots.map((s) => s.subjectId))];
  const teacherIds = [...new Set(dto.slots.map((s) => s.teacherId))];
  const [subjects, teachers, otherClassSlots] = await Promise.all([
    db_default.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true } }),
    db_default.teacher.findMany({ where: { id: { in: teacherIds } }, select: { id: true } }),
    //       never checked if a teacher was already teaching another class
    //       at the same time — a teacher could end up double-booked.
    db_default.timetable.findMany({
      where: { teacherId: { in: teacherIds }, classId: { not: dto.classId } },
      select: { teacherId: true, dayOfWeek: true, startTime: true, endTime: true }
    })
  ]);
  const missingSubject = subjectIds.find((id) => !subjects.some((s) => s.id === id));
  if (missingSubject) throw new Error(`Subject not found: ${missingSubject}`);
  const missingTeacher = teacherIds.find((id) => !teachers.some((t) => t.id === id));
  if (missingTeacher) throw new Error(`Teacher not found: ${missingTeacher}`);
  _checkBatchConflicts(dto.slots, otherClassSlots);
  const result = await db_default.$transaction(async (tx) => {
    await tx.timetable.deleteMany({ where: { classId: dto.classId } });
    await tx.timetable.createMany({
      data: dto.slots.map((slot) => ({ ...slot, classId: dto.classId, sectionId: section.id }))
    });
    return tx.timetable.findMany({
      where: { classId: dto.classId },
      select: SLOT_SELECT,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
  });
  cacheClearForClass(dto.classId);
  teacherIds.forEach(cacheClearForTeacher);
  return result;
};
var finAll = async (query, pagination = {}) => {
  const { classId, teacherId, dayOfWeek } = query;
  const page = pagination.page ?? 1;
  const pageSize = Math.min(pagination.pageSize ?? 50, 100);
  const where = {
    ...classId && { classId },
    ...teacherId && { teacherId },
    ...dayOfWeek && { dayOfWeek }
  };
  return db_default.timetable.findMany({
    where,
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });
};
var getClassWeeklyView = async (classId) => {
  const cached = cacheGet(`class:${classId}`);
  if (cached) return cached;
  const classExists = await db_default.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!classExists) throw new Error("Class not found");
  const slots = await db_default.timetable.findMany({
    where: { classId },
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });
  const week = _groupByDay(slots);
  cacheSet(`class:${classId}`, week);
  return week;
};
var getTeacherWeeklyView = async (teacherId) => {
  const cached = cacheGet(`teacher:${teacherId}`);
  if (cached) return cached;
  const teacherExists = await db_default.teacher.findUnique({ where: { id: teacherId }, select: { id: true } });
  if (!teacherExists) throw new Error("Teacher not found");
  const slots = await db_default.timetable.findMany({
    where: { teacherId },
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });
  const week = _groupByDay(slots);
  cacheSet(`teacher:${teacherId}`, week);
  return week;
};
var findById2 = async (id) => {
  const slot = await db_default.timetable.findUnique({ where: { id }, select: SLOT_SELECT });
  if (!slot) throw new Error("Slot not found");
  return slot;
};
var update2 = async (id, dto) => {
  const existing = await db_default.timetable.findUnique({ where: { id } });
  if (!existing) throw new Error("Slot not found");
  const merged = {
    classId: existing.classId,
    subjectId: dto.subjectId || existing.subjectId,
    teacherId: dto.teacherId || existing.teacherId,
    dayOfWeek: dto.dayOfWeek || existing.dayOfWeek,
    startTime: dto.startTime || existing.startTime,
    endTime: dto.endTime || existing.endTime
  };
  await _checkConflicts(merged, id);
  try {
    const updated = await db_default.timetable.update({ where: { id }, data: dto, select: SLOT_SELECT });
    cacheClearForClass(existing.classId);
    cacheClearForTeacher(existing.teacherId);
    if (dto.teacherId) cacheClearForTeacher(dto.teacherId);
    return updated;
  } catch (err) {
    if (err?.code === "P2002") {
      throw new Error("Schedule conflict: the class or teacher already has a slot during this time");
    }
    throw err;
  }
};
var deleteSlot = async (id) => {
  const existing = await db_default.timetable.findUnique({ where: { id }, select: { classId: true, teacherId: true } });
  const result = await db_default.timetable.delete({ where: { id } });
  if (existing) {
    cacheClearForClass(existing.classId);
    cacheClearForTeacher(existing.teacherId);
  }
  return result;
};
var deleteClassSchefule = async (classId) => {
  const classexits = await db_default.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!classexits) throw new Error("Class not found");
  const { count } = await db_default.timetable.deleteMany({ where: { classId } });
  cacheClearForClass(classId);
  cacheClearAll();
  return { deletedSlots: count };
};
var getMyClassTimetable = async (studentId) => {
  const student = await db_default.student.findUnique({
    where: { id: studentId },
    select: { classId: true }
  });
  if (!student) throw new Error("Student not found");
  return getClassWeeklyView(student.classId);
};
var getChildClassTimetable = async (parentId, studentId) => {
  const student = await db_default.student.findFirst({
    where: { id: studentId, parentId },
    select: { classId: true }
  });
  if (!student) throw new Error("Child not found for this parent");
  return getClassWeeklyView(student.classId);
};
var teacherTeachesClass = async (teacherId, classId) => {
  if (!teacherId) return false;
  const slot = await db_default.timetable.findFirst({
    where: { teacherId, classId },
    select: { id: true }
  });
  return Boolean(slot);
};
function _todayDayOfWeek() {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[(/* @__PURE__ */ new Date()).getDay()];
}
var getTodaysClassesForStudent = async (studentId) => {
  const student = await db_default.student.findUnique({
    where: { id: studentId },
    select: { classId: true, sectionId: true }
  });
  if (!student) throw new Error("Student not found");
  return db_default.timetable.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek: _todayDayOfWeek() },
    select: SLOT_SELECT,
    orderBy: { startTime: "asc" }
  });
};
var getTodaysClassesForChild = async (parentId, studentId) => {
  const student = await db_default.student.findFirst({
    where: { id: studentId, parentId },
    select: { classId: true, sectionId: true }
  });
  if (!student) throw new Error("Child not found for this parent");
  return db_default.timetable.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek: _todayDayOfWeek() },
    select: SLOT_SELECT,
    orderBy: { startTime: "asc" }
  });
};
function _groupByDay(slots) {
  const week = {};
  for (const slot of slots) {
    (week[slot.dayOfWeek] ??= []).push(slot);
  }
  return week;
}
function _overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}
async function _checkConflicts(dto, excludeId) {
  const overlap = await db_default.timetable.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : void 0,
      dayOfWeek: dto.dayOfWeek,
      OR: [{ classId: dto.classId }, { teacherId: dto.teacherId }],
      AND: [{ startTime: { lt: dto.endTime } }, { endTime: { gt: dto.startTime } }]
    },
    select: { id: true }
  });
  if (overlap) {
    throw new Error("Schedule conflict: the class or teacher already has a slot during this time");
  }
}
function _checkBatchConflicts(newSlots, existingOtherClassSlots) {
  for (let i = 0; i < newSlots.length; i++) {
    const a = newSlots[i];
    for (const b of existingOtherClassSlots) {
      if (a.teacherId === b.teacherId && a.dayOfWeek === b.dayOfWeek && _overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
        throw new Error(`Schedule conflict: teacher already booked elsewhere on ${a.dayOfWeek} at ${a.startTime}`);
      }
    }
    for (let j = i + 1; j < newSlots.length; j++) {
      const b = newSlots[j];
      if (a.teacherId === b.teacherId && a.dayOfWeek === b.dayOfWeek && _overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
        throw new Error(`Schedule conflict within submitted batch: ${a.dayOfWeek} ${a.startTime}-${a.endTime}`);
      }
    }
  }
}

// src/modules/parents/parents.service.ts
init_db();
var PARENT_SELECT = {
  id: true,
  name: true,
  phone: true,
  address: true,
  occupation: true,
  relation: true,
  createdAt: true,
  user: { select: { id: true, email: true } }
};
var ParentsService = class {
  static async createParent(dto) {
    const [user, existingParent] = await Promise.all([
      db_default.user.findUnique({ where: { id: dto.userId }, select: { id: true } }),
      db_default.parent.findUnique({ where: { userId: dto.userId }, select: { id: true } })
    ]);
    if (!user) throw new Error("User not found");
    if (existingParent) throw new Error("A parent profile already exists for this user");
    return db_default.parent.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        occupation: dto.occupation,
        relation: dto.relation
      },
      select: PARENT_SELECT
    });
  }
  // ─── ADMIN: update any parent's profile ─────────────────────────
  static async updateParent(parentId, dto) {
    const existing = await db_default.parent.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!existing) throw new Error("Parent not found");
    return db_default.parent.update({ where: { id: parentId }, data: dto, select: PARENT_SELECT });
  }
  // ─── ADMIN: delete a parent profile ──────────────────────────────
  static async deleteParent(parentId) {
    const existing = await db_default.parent.findUnique({
      where: { id: parentId },
      select: { id: true, children: { select: { id: true } } }
    });
    if (!existing) throw new Error("Parent not found");
    if (existing.children.length > 0) {
      throw new Error("Unlink all children from this parent before deleting the profile");
    }
    return db_default.parent.delete({ where: { id: parentId } });
  }
  // ─── ADMIN: paginated list, optional search by name/phone ───────
  static async getAllParents(query) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = query.search ? {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } }
      ]
    } : {};
    const [total, data] = await Promise.all([
      db_default.parent.count({ where }),
      db_default.parent.findMany({
        where,
        select: { ...PARENT_SELECT, children: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  // ─── ADMIN: single parent, with children list ────────────────────
  static async getParentById(parentId) {
    const parent = await db_default.parent.findUnique({
      where: { id: parentId },
      select: {
        ...PARENT_SELECT,
        children: { select: { id: true, name: true, classId: true, sectionId: true } }
      }
    });
    if (!parent) throw new Error("Parent not found");
    return parent;
  }
  // ─── ADMIN: link a student to this parent ────────────────────────
  static async linkChild(parentId, studentId) {
    const [parent, student] = await Promise.all([
      db_default.parent.findUnique({ where: { id: parentId }, select: { id: true } }),
      db_default.student.findUnique({ where: { id: studentId }, select: { id: true, parentId: true } })
    ]);
    if (!parent) throw new Error("Parent not found");
    if (!student) throw new Error("Student not found");
    if (student.parentId === parentId) throw new Error("This student is already linked to this parent");
    return db_default.student.update({ where: { id: studentId }, data: { parentId } });
  }
  // ─── ADMIN: unlink a student from this parent ────────────────────
  static async unlinkChild(parentId, studentId) {
    const student = await db_default.student.findFirst({ where: { id: studentId, parentId }, select: { id: true } });
    if (!student) throw new Error("This student is not linked to this parent");
    return db_default.student.update({ where: { id: studentId }, data: { parentId: null } });
  }
  // =====================================================================
  // PARENT SELF-SERVICE
  // =====================================================================
  // WHAT: resolves the logged-in User's own Parent id.
  // WHY: used by the timetable module and every method below — since
  //      Parent.userId is @unique, this is a single indexed lookup.
  static async getParentIdByUserId(userId) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: { id: true } });
    return parent?.id ?? null;
  }
  static async getMyProfile(userId) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: PARENT_SELECT });
    if (!parent) throw new Error("Parent profile not found");
    return parent;
  }
  static async updateMyProfile(userId, dto) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error("Parent profile not found");
    return db_default.parent.update({ where: { id: parent.id }, data: dto, select: PARENT_SELECT });
  }
  // WHAT: list of this parent's own children (basic info only —
  //       full academic detail comes from the students/timetable
  //       modules, this just confirms who the children are).
  static async getMyChildren(userId) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error("Parent profile not found");
    return db_default.student.findMany({
      where: { parentId: parent.id },
      select: { id: true, name: true, classId: true, sectionId: true, rollNumber: true },
      orderBy: { name: "asc" }
    });
  }
  // WHAT: this parent's own payment history (Stripe + offline records).
  static async getMyPayments(userId, pagination = {}) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error("Parent profile not found");
    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 20, 100);
    return db_default.payment.findMany({
      where: { parentId: parent.id },
      select: { id: true, amount: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }
  // WHAT: notices addressed to this parent (school-wide or class-specific
  //       notices get fanned out into NoticeRecipient rows elsewhere).
  static async getMyNotices(userId, pagination = {}) {
    const parent = await db_default.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error("Parent profile not found");
    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 20, 100);
    return db_default.noticeRecipient.findMany({
      where: { parentId: parent.id },
      select: {
        id: true,
        read: true,
        notice: { select: { id: true, title: true, content: true, createdAt: true } }
      },
      orderBy: { notice: { createdAt: "desc" } },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }
};

// src/modules/timetable/timetable.controller.ts
var TimetableController = class {
  // ── ADMIN: create a single slot ─────────────────────────────────
  async createSlot(req, res, next) {
    try {
      const slot = await createSlot(req.body);
      sendSuccess(res, slot, "Timetable slot created", 201);
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: replace a class's full weekly timetable ───────────────
  async bulkCreate(req, res, next) {
    try {
      const slots = await bulkCreate(req.body);
      sendSuccess(res, slots, "Timetable created", 201);
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN / TEACHER: filtered/paginated list ──────────────────────
  // NOTE: STUDENT was removed from this route's roles (see routes file).
  // A raw filter list isn't something a student should be able to query
  // freely with arbitrary classId/teacherId — they use /my-routine instead.
  async findAll(req, res, next) {
    try {
      const query = { ...req.query };
      const userRole = req.user?.role;
      if (userRole === "TEACHER") {
        const myTeacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
        query.teacherId = myTeacherId;
      }
      const page = query.page ? Number(query.page) : void 0;
      const pageSize = query.pageSize ? Number(query.pageSize) : void 0;
      delete query.page;
      delete query.pageSize;
      const data = await finAll(query, { page, pageSize });
      sendSuccess(res, data, "Timetable fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN / TEACHER: any class's weekly view, by classId ──────────
  // NOTE: STUDENT no longer allowed here (see routes file) — this is the
  // "browse any class" route, meant for staff use.
  async getClassWeeklyView(req, res, next) {
    try {
      const classId = req.params.classId;
      const userRole = req.user?.role;
      if (userRole === "TEACHER") {
        const myTeacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
        const teachesThisClass = await teacherTeachesClass(myTeacherId, classId);
        if (!teachesThisClass) {
          return res.status(403).json({ success: false, message: "You can only view classes you teach" });
        }
      }
      const data = await getClassWeeklyView(classId);
      sendSuccess(res, data, "Class weekly timetable fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN / TEACHER: a teacher's own weekly view ──────────────────
  async getTeacherWeeklyView(req, res, next) {
    try {
      const requestedTeacherId = req.params.teacherId;
      const userRole = req.user?.role;
      if (userRole === "TEACHER") {
        const myTeacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
        if (!myTeacherId || myTeacherId !== requestedTeacherId) {
          return res.status(403).json({ success: false, message: "You can only view your own timetable" });
        }
      }
      const data = await getTeacherWeeklyView(requestedTeacherId);
      sendSuccess(res, data, "Teacher weekly timetable fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── STUDENT: "my routine" — classId resolved server-side ──────────
  // WHAT: student never supplies a classId — we look it up from their
  //       own profile, so there is nothing to fake or guess.
  async getMyRoutine(req, res, next) {
    try {
      const studentId = await StudentsService.getStudentIdByUserId(req.user?.id);
      if (!studentId) return res.status(404).json({ success: false, message: "Student profile not found" });
      const data = await getMyClassTimetable(studentId);
      sendSuccess(res, data, "Your weekly routine fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── STUDENT dashboard widget: today's classes only ────────────────
  async getMyTodayRoutine(req, res, next) {
    try {
      const studentId = await StudentsService.getStudentIdByUserId(req.user?.id);
      if (!studentId) return res.status(404).json({ success: false, message: "Student profile not found" });
      const data = await getTodaysClassesForStudent(studentId);
      sendSuccess(res, data, "Today's classes fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── PARENT: routine for one of their children ──────────────────────
  // WHAT: ownership is verified inside the service (student must belong
  //       to this parent) before any data is returned.
  async getChildRoutine(req, res, next) {
    try {
      const parentId = await ParentsService.getParentIdByUserId(req.user?.id);
      if (!parentId) return res.status(404).json({ success: false, message: "Parent profile not found" });
      const studentId = req.params.studentId;
      const data = await getChildClassTimetable(parentId, studentId);
      sendSuccess(res, data, "Child's weekly routine fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── PARENT dashboard widget: today's classes for one child ────────
  async getChildTodayRoutine(req, res, next) {
    try {
      const parentId = await ParentsService.getParentIdByUserId(req.user?.id);
      if (!parentId) return res.status(404).json({ success: false, message: "Parent profile not found" });
      const studentId = req.params.studentId;
      const data = await getTodaysClassesForChild(parentId, studentId);
      sendSuccess(res, data, "Child's classes for today fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN / TEACHER: single slot by id ─────────────────────────────
  async findById(req, res, next) {
    try {
      const slotId = req.params.id;
      const userRole = req.user?.role;
      const slot = await findById2(slotId);
      if (userRole === "TEACHER") {
        const myTeacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
        if (slot.teacher.id !== myTeacherId) {
          return res.status(403).json({ success: false, message: "You can only view your own timetable slots" });
        }
      }
      sendSuccess(res, slot, "Slot fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: update a slot ────────────────────────────────────────────
  async update(req, res, next) {
    try {
      const slot = await update2(req.params.id, req.body);
      sendSuccess(res, slot, "Slot updated");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: delete one slot ──────────────────────────────────────────
  async delete(req, res, next) {
    try {
      await deleteSlot(req.params.id);
      sendSuccess(res, null, "Slot deleted");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: wipe a class's entire schedule ───────────────────────────
  async deleteClassSchedule(req, res, next) {
    try {
      const result = await deleteClassSchefule(req.params.classId);
      sendSuccess(res, result, "Class schedule cleared");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/timetable/timetable.routes.ts
var router13 = (0, import_express13.Router)();
var c6 = new TimetableController();
router13.use(authenticate);
router13.get("/my-routine", authorizeRoles("STUDENT"), c6.getMyRoutine.bind(c6));
router13.get("/my-routine/today", authorizeRoles("STUDENT"), c6.getMyTodayRoutine.bind(c6));
router13.get("/parent/child/:studentId", authorizeRoles("PARENT"), c6.getChildRoutine.bind(c6));
router13.get("/parent/child/:studentId/today", authorizeRoles("PARENT"), c6.getChildTodayRoutine.bind(c6));
router13.get("/", authorizeRoles("SCHOOL_ADMIN", "TEACHER"), c6.findAll.bind(c6));
router13.get("/class/:classId", authorizeRoles("SCHOOL_ADMIN", "TEACHER"), c6.getClassWeeklyView.bind(c6));
router13.get("/teacher/:teacherId", authorizeRoles("SCHOOL_ADMIN", "TEACHER"), c6.getTeacherWeeklyView.bind(c6));
router13.get("/:id", authorizeRoles("SCHOOL_ADMIN", "TEACHER"), c6.findById.bind(c6));
router13.post("/", authorizeRoles("EXAM_CONTROLLER"), c6.createSlot.bind(c6));
router13.post("/bulk", authorizeRoles("EXAM_CONTROLLER"), c6.bulkCreate.bind(c6));
router13.patch("/:id", authorizeRoles("EXAM_CONTROLLER"), c6.update.bind(c6));
router13.delete("/class/:classId", authorizeRoles("EXAM_CONTROLLER"), c6.deleteClassSchedule.bind(c6));
router13.delete("/:id", authorizeRoles("EXAM_CONTROLLER"), c6.delete.bind(c6));
var timetable_routes_default = router13;

// src/modules/parents/parents.routes.ts
var import_express14 = require("express");

// src/modules/parents/parents.controller.ts
var ParentsController = class {
  // ── ADMIN: create a parent profile ────────────────────────────────
  async create(req, res, next) {
    try {
      const parent = await ParentsService.createParent(req.body);
      sendSuccess(res, parent, "Parent profile created", 201);
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: update any parent by id ────────────────────────────────
  async update(req, res, next) {
    try {
      const parent = await ParentsService.updateParent(req.params.id, req.body);
      sendSuccess(res, parent, "Parent profile updated");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: delete a parent profile ────────────────────────────────
  async delete(req, res, next) {
    try {
      await ParentsService.deleteParent(req.params.id);
      sendSuccess(res, null, "Parent profile deleted");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: paginated list, optional ?search= ──────────────────────
  async findAll(req, res, next) {
    try {
      const { search, page, pageSize } = req.query;
      const result = await ParentsService.getAllParents({
        search,
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, result, "Parents fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: single parent by id, with children ─────────────────────
  async findById(req, res, next) {
    try {
      const parent = await ParentsService.getParentById(req.params.id);
      sendSuccess(res, parent, "Parent fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: link a student to a parent ─────────────────────────────
  async linkChild(req, res, next) {
    try {
      const { studentId } = req.body;
      const result = await ParentsService.linkChild(req.params.id, studentId);
      sendSuccess(res, result, "Child linked to parent");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN: unlink a student from a parent ─────────────────────────
  async unlinkChild(req, res, next) {
    try {
      const result = await ParentsService.unlinkChild(req.params.id, req.params.studentId);
      sendSuccess(res, result, "Child unlinked from parent");
    } catch (err) {
      next(err);
    }
  }
  // =====================================================================
  // PARENT SELF-SERVICE — resolves everything from the logged-in user,
  // never trusts a parentId from the client.
  // =====================================================================
  async getMyProfile(req, res, next) {
    try {
      const profile = await ParentsService.getMyProfile(req.user?.id);
      sendSuccess(res, profile, "Your profile fetched");
    } catch (err) {
      next(err);
    }
  }
  async updateMyProfile(req, res, next) {
    try {
      const profile = await ParentsService.updateMyProfile(req.user?.id, req.body);
      sendSuccess(res, profile, "Your profile updated");
    } catch (err) {
      next(err);
    }
  }
  async getMyChildren(req, res, next) {
    try {
      const children = await ParentsService.getMyChildren(req.user?.id);
      sendSuccess(res, children, "Your children fetched");
    } catch (err) {
      next(err);
    }
  }
  async getMyPayments(req, res, next) {
    try {
      const { page, pageSize } = req.query;
      const payments = await ParentsService.getMyPayments(req.user?.id, {
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, payments, "Your payment history fetched");
    } catch (err) {
      next(err);
    }
  }
  async getMyNotices(req, res, next) {
    try {
      const { page, pageSize } = req.query;
      const notices = await ParentsService.getMyNotices(req.user?.id, {
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, notices, "Your notices fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/parents/parents.routes.ts
var router14 = (0, import_express14.Router)();
var c7 = new ParentsController();
router14.use(authenticate);
router14.get("/me", authorizeRoles("PARENT"), c7.getMyProfile.bind(c7));
router14.patch("/me", authorizeRoles("PARENT"), c7.updateMyProfile.bind(c7));
router14.get("/me/children", authorizeRoles("PARENT"), c7.getMyChildren.bind(c7));
router14.get("/me/payments", authorizeRoles("PARENT"), c7.getMyPayments.bind(c7));
router14.get("/me/notices", authorizeRoles("PARENT"), c7.getMyNotices.bind(c7));
router14.get("/", authorizeRoles("SCHOOL_ADMIN"), c7.findAll.bind(c7));
router14.post("/", authorizeRoles("SCHOOL_ADMIN"), c7.create.bind(c7));
router14.get("/:id", authorizeRoles("SCHOOL_ADMIN"), c7.findById.bind(c7));
router14.patch("/:id", authorizeRoles("SCHOOL_ADMIN"), c7.update.bind(c7));
router14.delete("/:id", authorizeRoles("SCHOOL_ADMIN"), c7.delete.bind(c7));
router14.post("/:id/children", authorizeRoles("SCHOOL_ADMIN"), c7.linkChild.bind(c7));
router14.delete(
  "/:id/children/:studentId",
  authorizeRoles("SCHOOL_ADMIN"),
  c7.unlinkChild.bind(c7)
);
var parents_routes_default = router14;

// src/modules/notifiction/notifictaion.routes.ts
var import_express15 = require("express");

// src/modules/notifiction/notification.controller.ts
init_notification_service();
var NotificationController = class {
  /** Admin: manually send to a single user */
  async send(req, res, next) {
    try {
      const notification = await send(req.body);
      sendSuccess(res, notification, "Notification sent", 201);
    } catch (err) {
      next(err);
    }
  }
  /** Admin: broadcast to a role or everyone */
  async broadcast(req, res, next) {
    try {
      const result = await broadcast(req.body);
      sendSuccess(res, result, `Notification broadcast to ${result.sent} users`);
    } catch (err) {
      next(err);
    }
  }
  /** User: get own notifications */
  async findAll(req, res, next) {
    try {
      const data = await findAll3(req.user.id, req.query);
      sendSuccess(res, data, "Notifications fetched");
    } catch (err) {
      next(err);
    }
  }
  async getUnreadCount(req, res, next) {
    try {
      const data = await getUnreadCount(req.user.id);
      sendSuccess(res, data, "Unread count fetched");
    } catch (err) {
      next(err);
    }
  }
  async markRead(req, res, next) {
    try {
      const notification = await markRead(req.params.id, req.user.id);
      sendSuccess(res, notification, "Marked as read");
    } catch (err) {
      next(err);
    }
  }
  async markAllRead(req, res, next) {
    try {
      const result = await markAllRead(req.user.id);
      sendSuccess(res, result, "All notifications marked as read");
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      await deleteNotification(req.params.id, req.user.id);
      sendSuccess(res, null, "Notification deleted");
    } catch (err) {
      next(err);
    }
  }
  async deleteAll(req, res, next) {
    try {
      const result = await deleteAll(req.user.id);
      sendSuccess(res, result, "All notifications deleted");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/notifiction/notifictaion.routes.ts
var router15 = (0, import_express15.Router)();
var c8 = new NotificationController();
router15.use(authenticate);
router15.post("/", authorizeRoles("SCHOOL_ADMIN"), c8.send.bind(c8));
router15.post("/broadcast", authorizeRoles("SCHOOL_ADMIN"), c8.broadcast.bind(c8));
router15.get("/", c8.findAll.bind(c8));
router15.get("/unread-count", c8.getUnreadCount.bind(c8));
router15.patch("/mark-all-read", c8.markAllRead.bind(c8));
router15.delete("/clear-all", c8.deleteAll.bind(c8));
router15.patch("/:id/read", c8.markRead.bind(c8));
router15.delete("/:id", c8.delete.bind(c8));
var notifictaion_routes_default = router15;

// src/modules/homework/howework.routes.ts
var import_express16 = require("express");

// src/modules/homework/homework.service.ts
init_db();
var HOMEWORK_SELECT = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  isReviewed: true,
  createdAt: true,
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: { select: { id: true, employeeId: true, user: { select: { name: true } } } }
};
var CACHE_TTL_MS2 = 3e4;
var sectionHomeworkCache = /* @__PURE__ */ new Map();
function _cacheGet(sectionId) {
  const entry = sectionHomeworkCache.get(sectionId);
  if (!entry) return void 0;
  if (Date.now() > entry.expiresAt) {
    sectionHomeworkCache.delete(sectionId);
    return void 0;
  }
  return entry.value;
}
function _cacheSet(sectionId, value) {
  sectionHomeworkCache.set(sectionId, { value, expiresAt: Date.now() + CACHE_TTL_MS2 });
}
function _cacheClear(sectionId) {
  sectionHomeworkCache.delete(sectionId);
}
function _isOverdue(dueDate) {
  return dueDate.getTime() < Date.now();
}
function _withComputedStatus(hw) {
  return { ...hw, isOverdue: _isOverdue(hw.dueDate) };
}
var HomeworkService = class {
  static async create(teacherId, dto) {
    const [section, subject, teaches] = await Promise.all([
      db_default.section.findUnique({ where: { id: dto.sectionId }, select: { id: true } }),
      db_default.subject.findUnique({ where: { id: dto.subjectId }, select: { id: true } }),
      // WHAT: confirm this teacher is actually assigned to teach this
      //       subject in this section (via the Timetable relation).
      db_default.timetable.findFirst({
        where: { teacherId, sectionId: dto.sectionId, subjectId: dto.subjectId },
        select: { id: true }
      })
    ]);
    if (!section) throw new Error("Section not found");
    if (!subject) throw new Error("Subject not found");
    if (!teaches) throw new Error("You are not assigned to teach this subject for this section");
    const homework = await db_default.homework.create({
      data: {
        teacherId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate)
      },
      select: HOMEWORK_SELECT
    });
    _cacheClear(dto.sectionId);
    return _withComputedStatus(homework);
  }
  static async update(teacherId, id, dto) {
    const existing = await db_default.homework.findUnique({ where: { id }, select: { id: true, teacherId: true, sectionId: true } });
    if (!existing) throw new Error("Homework not found");
    if (existing.teacherId !== teacherId) throw new Error("You can only edit your own homework");
    const homework = await db_default.homework.update({
      where: { id },
      data: {
        ...dto.title !== void 0 && { title: dto.title },
        ...dto.description !== void 0 && { description: dto.description },
        ...dto.dueDate !== void 0 && { dueDate: new Date(dto.dueDate) }
      },
      select: HOMEWORK_SELECT
    });
    _cacheClear(existing.sectionId);
    return _withComputedStatus(homework);
  }
  // WHAT: marks the whole homework item as reviewed by the teacher
  //       (this schema tracks review at the homework level, not a
  //       per-student submission — there's no separate submission model).
  static async markReviewed(teacherId, id) {
    const existing = await db_default.homework.findUnique({ where: { id }, select: { teacherId: true, sectionId: true } });
    if (!existing) throw new Error("Homework not found");
    if (existing.teacherId !== teacherId) throw new Error("You can only review your own homework");
    const homework = await db_default.homework.update({ where: { id }, data: { isReviewed: true }, select: HOMEWORK_SELECT });
    _cacheClear(existing.sectionId);
    return _withComputedStatus(homework);
  }
  static async delete(teacherId, id) {
    const existing = await db_default.homework.findUnique({ where: { id }, select: { teacherId: true, sectionId: true } });
    if (!existing) throw new Error("Homework not found");
    if (existing.teacherId !== teacherId) throw new Error("You can only delete your own homework");
    await db_default.$transaction([
      db_default.homeworkView.deleteMany({ where: { homeworkId: id } }),
      db_default.homework.delete({ where: { id } })
    ]);
    _cacheClear(existing.sectionId);
  }
  // WHAT: paginated list of a teacher's own homework, with optional
  //       status filter (PENDING / REVIEWED / OVERDUE) computed in JS
  //       since these aren't stored columns.
  static async listMine(teacherId, query) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = {
      teacherId,
      ...query.sectionId && { sectionId: query.sectionId },
      ...query.subjectId && { subjectId: query.subjectId }
    };
    const all = await db_default.homework.findMany({
      where,
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: "desc" }
    });
    let withStatus = all.map(_withComputedStatus);
    if (query.status === "PENDING") withStatus = withStatus.filter((h) => !h.isReviewed && !h.isOverdue);
    if (query.status === "REVIEWED") withStatus = withStatus.filter((h) => h.isReviewed);
    if (query.status === "OVERDUE") withStatus = withStatus.filter((h) => !h.isReviewed && h.isOverdue);
    const total = withStatus.length;
    const data = withStatus.slice((page - 1) * pageSize, page * pageSize);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  // WHAT: single homework item with view stats — how many students in
  //       the section have viewed it vs. the section's total headcount.
  static async getById(id) {
    const homework = await db_default.homework.findUnique({ where: { id }, select: HOMEWORK_SELECT });
    if (!homework) throw new Error("Homework not found");
    const [viewedCount, totalStudents] = await Promise.all([
      db_default.homeworkView.count({ where: { homeworkId: id } }),
      db_default.student.count({ where: { sectionId: homework.section.id } })
    ]);
    return { ..._withComputedStatus(homework), viewedCount, totalStudents };
  }
  // ── TEACHER dashboard widget: own overdue-and-unreviewed homework ──
  static async listOverdue(teacherId) {
    const homework = await db_default.homework.findMany({
      where: { teacherId, isReviewed: false, dueDate: { lt: /* @__PURE__ */ new Date() } },
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: "asc" }
    });
    return homework.map(_withComputedStatus);
  }
  // =====================================================================
  // STUDENT / PARENT (shared internal logic)
  // =====================================================================
  // WHAT: cached list of ALL homework for a section (no per-student data).
  static async _getSectionHomework(sectionId) {
    const cached = _cacheGet(sectionId);
    if (cached) return cached;
    const homework = await db_default.homework.findMany({
      where: { sectionId },
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: "desc" }
    });
    const withStatus = homework.map(_withComputedStatus);
    _cacheSet(sectionId, withStatus);
    return withStatus;
  }
  // WHAT: merges the shared section-level cached list with THIS
  //       student's own "viewed" flags (one small extra query).
  static async _getHomeworkForStudent(sectionId, studentId, query) {
    const [sectionHomework, myViews] = await Promise.all([
      this._getSectionHomework(sectionId),
      db_default.homeworkView.findMany({ where: { studentId }, select: { homeworkId: true } })
    ]);
    const viewedSet = new Set(myViews.map((v) => v.homeworkId));
    let list = sectionHomework.map((hw) => ({ ...hw, viewed: viewedSet.has(hw.id) }));
    if (query.status === "UPCOMING") list = list.filter((h) => !h.isOverdue);
    if (query.status === "OVERDUE") list = list.filter((h) => h.isOverdue);
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const total = list.length;
    const data = list.slice((page - 1) * pageSize, page * pageSize);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  // ── STUDENT: own homework, classId/sectionId resolved server-side ──
  static async getMyHomework(studentId, query) {
    const student = await db_default.student.findUnique({ where: { id: studentId }, select: { sectionId: true } });
    if (!student) throw new Error("Student not found");
    return this._getHomeworkForStudent(student.sectionId, studentId, query);
  }
  // WHAT: student opens a homework item — records that they've seen it.
  // Uses upsert so calling it twice is harmless (unique constraint on
  // [homeworkId, studentId] would otherwise throw P2002 on a repeat view).
  static async markViewed(studentId, homeworkId) {
    const [student, homework] = await Promise.all([
      db_default.student.findUnique({ where: { id: studentId }, select: { sectionId: true } }),
      db_default.homework.findUnique({ where: { id: homeworkId }, select: { sectionId: true } })
    ]);
    if (!student) throw new Error("Student not found");
    if (!homework) throw new Error("Homework not found");
    if (homework.sectionId !== student.sectionId) throw new Error("This homework is not assigned to your section");
    return db_default.homeworkView.upsert({
      where: { homeworkId_studentId: { homeworkId, studentId } },
      update: {},
      // already viewed — no-op, just confirms it's recorded
      create: { homeworkId, studentId }
    });
  }
  // ── PARENT: a child's homework, ownership verified first ───────────
  static async getChildHomework(parentId, studentId, query) {
    const student = await db_default.student.findFirst({
      where: { id: studentId, parentId },
      select: { sectionId: true }
    });
    if (!student) throw new Error("Child not found for this parent");
    return this._getHomeworkForStudent(student.sectionId, studentId, query);
  }
};

// src/modules/homework/homework.controller.ts
var HomeworkController = class {
  // ── TEACHER: create 
  async create(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      const homework = await HomeworkService.create(teacherId, req.body);
      sendSuccess(res, homework, "Homework created", 201);
    } catch (err) {
      next(err);
    }
  }
  // ── TEACHER: update 
  async update(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      const homework = await HomeworkService.update(teacherId, req.params.id, req.body);
      sendSuccess(res, homework, "Homework updated");
    } catch (err) {
      next(err);
    }
  }
  // ── TEACHER: mark reviewed 
  async markReviewed(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      const homework = await HomeworkService.markReviewed(teacherId, req.params.id);
      sendSuccess(res, homework, "Homework marked as reviewed");
    } catch (err) {
      next(err);
    }
  }
  // ── TEACHER: delete ─
  async delete(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      await HomeworkService.delete(teacherId, req.params.id);
      sendSuccess(res, null, "Homework deleted");
    } catch (err) {
      next(err);
    }
  }
  // ── TEACHER: list own homework, filterable 
  async listMine(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      const { sectionId, subjectId, status, page, pageSize } = req.query;
      const result = await HomeworkService.listMine(teacherId, {
        sectionId,
        subjectId,
        status,
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, result, "Homework fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── TEACHER dashboard widget: overdue & unreviewed 
  async listOverdue(req, res, next) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId(req.user?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: "Teacher profile not found" });
      const data = await HomeworkService.listOverdue(teacherId);
      sendSuccess(res, data, "Overdue homework fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── ADMIN / TEACHER: single item with view stats 
  async getById(req, res, next) {
    try {
      const homework = await HomeworkService.getById(req.params.id);
      sendSuccess(res, homework, "Homework fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── STUDENT: own homework 
  async getMyHomework(req, res, next) {
    try {
      const studentId = await StudentService.getStudentIdByUserId(req.user?.id);
      if (!studentId) return res.status(404).json({ success: false, message: "Student profile not found" });
      const { status, page, pageSize } = req.query;
      const result = await HomeworkService.getMyHomework(studentId, {
        status,
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, result, "Your homework fetched");
    } catch (err) {
      next(err);
    }
  }
  // ── STUDENT: mark one item as viewed 
  async markViewed(req, res, next) {
    try {
      const studentId = await StudentService.getStudentIdByUserId(req.user?.id);
      if (!studentId) return res.status(404).json({ success: false, message: "Student profile not found" });
      const result = await HomeworkService.markViewed(studentId, req.params.id);
      sendSuccess(res, result, "Marked as viewed");
    } catch (err) {
      next(err);
    }
  }
  // ── PARENT: a specific child's homework 
  async getChildHomework(req, res, next) {
    try {
      const parentId = await ParentsService.getParentIdByUserId(req.user?.id);
      if (!parentId) return res.status(404).json({ success: false, message: "Parent profile not found" });
      const { status, page, pageSize } = req.query;
      const result = await HomeworkService.getChildHomework(parentId, req.params.studentId, {
        status,
        page: page ? Number(page) : void 0,
        pageSize: pageSize ? Number(pageSize) : void 0
      });
      sendSuccess(res, result, "Child's homework fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/homework/howework.routes.ts
var router16 = (0, import_express16.Router)();
var c9 = new HomeworkController();
router16.use(authenticate);
router16.get("/my-homework", authorizeRoles("STUDENT"), c9.getMyHomework.bind(c9));
router16.patch("/:id/viewed", authorizeRoles("STUDENT"), c9.markViewed.bind(c9));
router16.get("/child/:studentId", authorizeRoles("PARENT"), c9.getChildHomework.bind(c9));
router16.get("/my", authorizeRoles("TEACHER"), c9.listMine.bind(c9));
router16.get("/my/overdue", authorizeRoles("TEACHER"), c9.listOverdue.bind(c9));
router16.post("/", authorizeRoles("TEACHER"), c9.create.bind(c9));
router16.patch("/:id", authorizeRoles("TEACHER"), c9.update.bind(c9));
router16.patch("/:id/review", authorizeRoles("TEACHER"), c9.markReviewed.bind(c9));
router16.delete("/:id", authorizeRoles("TEACHER"), c9.delete.bind(c9));
router16.get("/:id", authorizeRoles("SCHOOL_ADMIN", "TEACHER"), c9.getById.bind(c9));
var howework_routes_default = router16;

// src/modules/superAdmin/superAdmin.route.ts
var import_express17 = require("express");

// src/modules/superAdmin/superAdmin.controller.ts
init_db();
var SuperAdminController = class {
  async getSchools(req, res, next) {
    try {
      const totalStudents = await db_default.student.count();
      const totalTeachers = await db_default.teacher.count();
      const schoolData = [
        {
          id: 1,
          name: "Greenwood High",
          students: totalStudents,
          teachers: totalTeachers,
          status: "Active"
        }
      ];
      sendSuccess(res, schoolData, "Schools data fetched successfully");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/superAdmin/superAdmin.route.ts
var router17 = (0, import_express17.Router)();
var superAdminController = new SuperAdminController();
router17.use(authenticate);
router17.get(
  "/schools",
  authorizeRoles("SUPER_ADMIN"),
  superAdminController.getSchools.bind(superAdminController)
);
var superAdmin_route_default = router17;

// src/modules/hr/hr.routes.ts
var import_express18 = require("express");

// src/modules/hr/hr.service.ts
init_db();
init_pagination_util();
var import_pdfkit = __toESM(require("pdfkit"));
async function createDepartment(dto) {
  const existing = await db_default.department.findFirst({
    where: { OR: [{ name: dto.name }, ...dto.code ? [{ code: dto.code }] : []] }
  });
  if (existing) {
    throw { status: 409, message: "Department with this name or code already exists" };
  }
  return db_default.department.create({ data: dto });
}
async function findAllDepartments() {
  return db_default.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
}
async function updateDepartment(id, dto) {
  const dept = await db_default.department.findUnique({ where: { id } });
  if (!dept) throw { status: 404, message: "Department not found" };
  if (dto.name || dto.code) {
    const duplicate = await db_default.department.findFirst({
      where: {
        OR: [
          ...dto.name ? [{ name: dto.name }] : [],
          ...dto.code ? [{ code: dto.code }] : []
        ],
        NOT: { id }
      }
    });
    if (duplicate) throw { status: 409, message: "Department name or code already in use" };
  }
  return db_default.department.update({ where: { id }, data: dto });
}
async function deleteDepartment(id) {
  const dept = await db_default.department.findUnique({ where: { id } });
  if (!dept) throw { status: 404, message: "Department not found" };
  return db_default.department.update({ where: { id }, data: { isActive: false } });
}
async function nextAutoStaffId() {
  const all = await db_default.staff.findMany({ select: { employeeId: true } });
  const maxNumeric = all.reduce((max, s) => {
    const n = Number(s.employeeId);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNumeric + 1).padStart(2, "0");
}
async function createStaff(dto, actorId) {
  const emailExists = await db_default.user.findUnique({ where: { email: dto.email } });
  if (emailExists) {
    throw { status: 409, message: "A user with this email already exists" };
  }
  const emailDuplicate = await db_default.staff.findUnique({ where: { email: dto.email } });
  if (emailDuplicate) {
    throw { status: 409, message: "A staff record with this email already exists" };
  }
  let employeeId;
  const staffCode = dto.employeeId;
  if (staffCode) {
    const exists = await db_default.staff.findUnique({ where: { employeeId: staffCode } });
    if (exists) throw { status: 409, message: "Staff ID already exists" };
    employeeId = staffCode;
  } else {
    employeeId = await nextAutoStaffId();
  }
  const buildData = (id) => ({
    employeeId: id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    designation: dto.designation,
    departmentId: dto.departmentId,
    staffType: dto.staffType ?? "NON_TEACHING",
    qualification: dto.qualification,
    experience: dto.experience,
    address: dto.address,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : void 0,
    joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : void 0,
    bloodGroup: dto.bloodGroup,
    idProofUrl: dto.idProofUrl,
    certificates: dto.certificates ?? [],
    contractUrl: dto.contractUrl,
    reportingTo: dto.reportingTo
  });
  let newStaff;
  try {
    newStaff = await db_default.staff.create({ data: buildData(employeeId) });
  } catch (err) {
    if (err?.code === "P2002" && !staffCode) {
      employeeId = await nextAutoStaffId();
      newStaff = await db_default.staff.create({ data: buildData(employeeId) });
    } else {
      throw err;
    }
  }
  await initializeDefaultLeaveBalances(newStaff.id, (/* @__PURE__ */ new Date()).getFullYear());
  return newStaff;
}
async function findAllStaff(query) {
  const {
    page = "1",
    limit = "10",
    search,
    departmentId,
    designation,
    staffType,
    isActive
  } = query;
  const where = {
    ...isActive !== void 0 ? { isActive: isActive === "true" } : {},
    ...departmentId && { departmentId },
    ...designation && { designation: { contains: designation, mode: "insensitive" } },
    ...staffType && { staffType },
    ...search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } }
      ]
    }
  };
  const { skip, take, meta } = await paginate(db_default.staff, where, parseInt(page, 10), parseInt(limit, 10));
  const [staff, total] = await Promise.all([
    db_default.staff.findMany({
      where,
      skip,
      take,
      include: { department: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: "desc" }
    }),
    db_default.staff.count({ where })
  ]);
  return {
    staff,
    meta: { ...meta, total }
  };
}
async function findStaffById(id) {
  const staff = await db_default.staff.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, code: true } }
    }
  });
  if (!staff) throw { status: 404, message: "Staff not found" };
  return staff;
}
async function updateStaff(id, dto) {
  const staff = await db_default.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: "Staff not found" };
  if (dto.email && dto.email !== staff.email) {
    const emailExists = await db_default.staff.findFirst({
      where: { email: dto.email, NOT: { id } }
    });
    if (emailExists) throw { status: 409, message: "Email already in use by another staff member" };
  }
  return db_default.staff.update({
    where: { id },
    data: dto,
    include: { department: { select: { id: true, name: true, code: true } } }
  });
}
async function archiveStaff(id) {
  const staff = await db_default.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: "Staff not found" };
  return db_default.staff.update({ where: { id }, data: { isActive: false } });
}
async function restoreStaff(id) {
  const staff = await db_default.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: "Staff not found" };
  return db_default.staff.update({ where: { id }, data: { isActive: true } });
}
async function getStaffDirectory() {
  const staff = await db_default.staff.findMany({
    where: { isActive: true },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      designation: true,
      staffType: true,
      department: { select: { id: true, name: true, code: true } },
      joiningDate: true
    },
    orderBy: { name: "asc" }
  });
  return staff;
}
async function recordAttendance(dto, actorId) {
  const staff = await db_default.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: "Staff member not found" };
  const date = new Date(dto.date);
  date.setHours(0, 0, 0, 0);
  return db_default.staffAttendance.upsert({
    where: {
      staffId_date: { staffId: dto.staffId, date }
    },
    create: {
      staffId: dto.staffId,
      date,
      status: dto.status ?? "PRESENT",
      note: dto.note
    },
    update: {
      status: dto.status ?? "PRESENT",
      note: dto.note
    }
  });
}
async function recordBulkAttendance(dto, actorId) {
  const date = new Date(dto.date);
  date.setHours(0, 0, 0, 0);
  const results = [];
  for (const entry of dto.attendances) {
    const staff = await db_default.staff.findUnique({ where: { id: entry.staffId } });
    if (!staff) continue;
    const record = await db_default.staffAttendance.upsert({
      where: {
        staffId_date: { staffId: entry.staffId, date }
      },
      create: {
        staffId: entry.staffId,
        date,
        status: entry.status,
        note: entry.note
      },
      update: {
        status: entry.status,
        note: entry.note
      }
    });
    results.push(record);
  }
  return { date: dto.date, count: results.length, records: results };
}
async function getStaffAttendance(staffId, from, to) {
  const staff = await db_default.staff.findUnique({ where: { id: staffId } });
  if (!staff) throw { status: 404, message: "Staff member not found" };
  const where = { staffId };
  if (from) where.date = { gte: new Date(from) };
  if (to) where.date = { ...where.date, lte: new Date(to) };
  return db_default.staffAttendance.findMany({
    where,
    orderBy: { date: "desc" }
  });
}
async function getDailyAttendance(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const records = await db_default.staffAttendance.findMany({
    where: { date: targetDate },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true, staffType: true, department: { select: { name: true } } } } },
    orderBy: { staff: { name: "asc" } }
  });
  return {
    date,
    total: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    records: records.map((r) => ({
      id: r.id,
      staffId: r.staffId,
      staffName: r.staff.name,
      employeeId: r.staff.employeeId,
      designation: r.staff.designation,
      staffType: r.staff.staffType,
      department: r.staff.department?.name,
      status: r.status,
      note: r.note
    }))
  };
}
async function getAttendanceMonthlySummary(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const allStaff = await db_default.staff.findMany({
    where: { isActive: true },
    select: { id: true, name: true, employeeId: true, designation: true }
  });
  const summaries = [];
  for (const staff of allStaff) {
    const attendances = await db_default.staffAttendance.findMany({
      where: { staffId: staff.id, date: { gte: start, lte: end } }
    });
    const totalDays = attendances.length;
    const present = attendances.filter((a) => a.status === "PRESENT").length;
    const absent = attendances.filter((a) => a.status === "ABSENT").length;
    const late = attendances.filter((a) => a.status === "LATE").length;
    const leaves = await db_default.leave.findMany({
      where: {
        staffId: staff.id,
        status: "APPROVED",
        startDate: { lte: end },
        endDate: { gte: start }
      }
    });
    summaries.push({
      staffId: staff.id,
      employeeId: staff.employeeId,
      name: staff.name,
      designation: staff.designation,
      totalWorkingDays: totalDays,
      present,
      absent,
      late,
      leaveDays: leaves.length,
      attendancePercent: totalDays > 0 ? Math.round(present / totalDays * 100) : 0
    });
  }
  return { month, year, summaries };
}
async function createLeaveRequest(dto, staffId) {
  const staff = await db_default.staff.findUnique({ where: { id: dto.staffId || staffId } });
  if (!staff) throw { status: 404, message: "Staff member not found" };
  const leave = await db_default.leave.create({
    data: {
      staffId: dto.staffId || staffId,
      leaveType: dto.leaveType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason
    }
  });
  return leave;
}
async function findAllLeaveRequests(query) {
  const { page = "1", limit = "10", status, staffId, leaveType } = query;
  const where = {};
  if (status) where.status = status;
  if (staffId) where.staffId = staffId;
  if (leaveType) where.leaveType = leaveType;
  const { skip, take, meta } = await paginate(
    db_default.leave,
    where,
    parseInt(page, 10),
    parseInt(limit, 10)
  );
  const [leaves, total] = await Promise.all([
    db_default.leave.findMany({
      where,
      skip,
      take,
      include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
      orderBy: { createdAt: "desc" }
    }),
    db_default.leave.count({ where })
  ]);
  return {
    leaves,
    meta: { ...meta, total }
  };
}
async function approveLeaveRequest(id, dto, actorId) {
  const leave = await db_default.leave.findUnique({ where: { id } });
  if (!leave) throw { status: 404, message: "Leave request not found" };
  if (leave.status !== "PENDING") throw { status: 400, message: "Leave request is not pending" };
  const approved = dto.approved;
  const updatedLeave = await db_default.leave.update({
    where: { id },
    data: {
      status: approved ? "APPROVED" : "REJECTED",
      approvedBy: actorId,
      rejectionReason: approved ? null : dto.rejectionReason
    },
    include: { staff: true }
  });
  if (approved) {
    const leaveDays = Math.ceil(
      (new Date(updatedLeave.endDate).getTime() - new Date(updatedLeave.startDate).getTime()) / (1e3 * 60 * 60 * 24)
    ) + 1;
    const year = new Date(updatedLeave.startDate).getFullYear();
    const balance = await db_default.leaveBalance.findFirst({
      where: { staffId: leave.staffId, leaveType: updatedLeave.leaveType, year }
    });
    if (balance) {
      await db_default.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: balance.usedDays + leaveDays }
      });
    }
    const isTeacher = await db_default.teacher.findUnique({ where: { id: leave.staffId } });
    if (isTeacher) {
      try {
        const { broadcast: broadcast2 } = await Promise.resolve().then(() => (init_notification_service(), notification_service_exports));
        await broadcast2({
          role: "EXAM_CONTROLLER",
          title: "Teacher Leave Approved - Reschedule Needed",
          body: `${isTeacher.name} (${isTeacher.designation ?? "Teacher"}) has been approved for leave from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()}. Please check affected timetable slots.`,
          type: "LEAVE",
          referenceId: leave.id
        });
      } catch (notifErr) {
        console.error("Failed to broadcast leave notification:", notifErr);
      }
    }
  }
  return updatedLeave;
}
async function getLeaveBalance(staffId, year) {
  const targetYear = year ?? (/* @__PURE__ */ new Date()).getFullYear();
  return db_default.leaveBalance.findMany({
    where: { staffId, year: targetYear },
    orderBy: { leaveType: "asc" }
  });
}
async function initializeDefaultLeaveBalances(staffId, year) {
  const leaveTypes = ["CASUAL", "SICK", "EARNED"];
  const defaults = {
    CASUAL: 10,
    SICK: 14,
    EARNED: 20
  };
  await db_default.leaveBalance.createMany({
    data: leaveTypes.map((lt) => ({
      staffId,
      leaveType: lt,
      totalDays: defaults[lt],
      year
    })),
    skipDuplicates: true
  });
}
async function calculateLeaveDaysInMonth(staffId, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return db_default.leave.count({
    where: {
      staffId,
      status: "APPROVED",
      startDate: { lte: end },
      endDate: { gte: start }
    }
  });
}
function calculateAttendanceDays(staffId, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return db_default.staffAttendance.count({
    where: {
      staffId,
      date: { gte: start, lte: end },
      status: { in: ["PRESENT", "LATE"] }
    }
  });
}
async function generatePayroll(dto, actorId) {
  const staff = await db_default.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: "Staff not found" };
  const existing = await db_default.payroll.findFirst({
    where: { staffId: dto.staffId, month: dto.month, year: dto.year }
  });
  if (existing) {
    throw { status: 409, message: "Payroll for this period already exists" };
  }
  const [attendanceDays, leaveDays] = await Promise.all([
    calculateAttendanceDays(dto.staffId, dto.month, dto.year),
    calculateLeaveDaysInMonth(dto.staffId, dto.month, dto.year)
  ]);
  const dailyRate = dto.basicPay / 26;
  const leaveDeduction = dailyRate * leaveDays;
  const netSalary = dto.basicPay + (dto.allowances ?? 0) - (dto.deductions ?? 0) - leaveDeduction;
  return db_default.payroll.create({
    data: {
      staffId: dto.staffId,
      month: dto.month,
      year: dto.year,
      basicPay: dto.basicPay,
      allowances: dto.allowances ?? 0,
      deductions: dto.deductions ?? 0,
      netSalary: Math.max(netSalary, 0),
      attendanceDays,
      leaveDays,
      generatedBy: actorId
    },
    include: { staff: { select: { id: true, name: true, employeeId: true } } }
  });
}
async function findAllPayrolls(query) {
  const { page = "1", limit = "10", month, year, staffId, status } = query;
  const where = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;
  const { skip, take, meta } = await paginate(
    db_default.payroll,
    where,
    parseInt(page, 10),
    parseInt(limit, 10)
  );
  const [payrolls, total] = await Promise.all([
    db_default.payroll.findMany({
      where,
      skip,
      take,
      include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    }),
    db_default.payroll.count({ where })
  ]);
  return {
    payrolls,
    meta: { ...meta, total }
  };
}
async function getPayrollHistory(staffId) {
  return db_default.payroll.findMany({
    where: { staffId },
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });
}
async function markPayrollPaid(id) {
  const payroll = await db_default.payroll.findUnique({ where: { id } });
  if (!payroll) throw { status: 404, message: "Payroll not found" };
  if (payroll.status === "PAID") throw { status: 400, message: "Payroll already marked as paid" };
  return db_default.payroll.update({
    where: { id },
    data: { status: "PAID", paidAt: /* @__PURE__ */ new Date() }
  });
}
async function getPendingPayrolls() {
  return db_default.payroll.findMany({
    where: { status: "PENDING" },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
    orderBy: [{ year: "asc" }, { month: "asc" }]
  });
}
async function createPerformanceReview(dto, reviewerId) {
  const staff = await db_default.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: "Staff not found" };
  return db_default.performanceReview.create({
    data: {
      staffId: dto.staffId,
      reviewDate: new Date(dto.reviewDate),
      rating: dto.rating,
      strengths: dto.strengths,
      areasToImprove: dto.areasToImprove,
      comments: dto.comments,
      reviewedBy: reviewerId
    },
    include: { staff: { select: { id: true, name: true, employeeId: true } } }
  });
}
async function findPerformanceReviews(staffId) {
  return db_default.performanceReview.findMany({
    where: { staffId },
    orderBy: { reviewDate: "desc" },
    include: { staff: { select: { id: true, name: true, employeeId: true } } }
  });
}
async function requestCriticalAction(dto, actorId) {
  return db_default.criticalAction.create({
    data: {
      actionType: dto.actionType,
      staffId: dto.staffId,
      staffName: dto.staffName,
      reason: dto.reason,
      details: dto.details ?? {},
      requestedBy: actorId
    }
  });
}
async function findPendingCriticalActions() {
  return db_default.criticalAction.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }
  });
}
async function findCriticalActionById(id) {
  const action = await db_default.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: "Critical action not found" };
  return action;
}
async function approveCriticalAction(id, reviewerId, reviewComment) {
  const action = await db_default.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: "Critical action not found" };
  if (action.status !== "PENDING") throw { status: 400, message: "Action is not pending" };
  const updated = await db_default.criticalAction.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: reviewerId,
      reviewComment
    }
  });
  if (action.actionType === "TERMINATION") {
    await db_default.staff.update({ where: { id: action.staffId }, data: { isActive: false } });
  }
  return updated;
}
async function rejectCriticalAction(id, reviewerId, reviewComment) {
  const action = await db_default.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: "Critical action not found" };
  if (action.status !== "PENDING") throw { status: 400, message: "Action is not pending" };
  return db_default.criticalAction.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedBy: reviewerId,
      reviewComment
    }
  });
}
async function getHRDashboardStats() {
  const [totalStaff, activeStaff, pendingLeaves, pendingPayrolls, pendingCriticalActions] = await Promise.all([
    db_default.staff.count(),
    db_default.staff.count({ where: { isActive: true } }),
    db_default.leave.count({ where: { status: "PENDING" } }),
    db_default.payroll.count({ where: { status: "PENDING" } }),
    db_default.criticalAction.count({ where: { status: "PENDING" } })
  ]);
  const now = /* @__PURE__ */ new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [attendanceStats] = await Promise.all([
    getAttendanceMonthlySummary(currentYear, currentMonth)
  ]);
  const avgAttendance = attendanceStats.summaries.length > 0 ? Math.round(
    attendanceStats.summaries.reduce((sum, s) => sum + s.attendancePercent, 0) / attendanceStats.summaries.length
  ) : 0;
  return {
    totalStaff,
    activeStaff,
    inactiveStaff: totalStaff - activeStaff,
    pendingLeaves,
    pendingPayrolls,
    pendingCriticalActions,
    avgAttendance,
    currentMonth,
    currentYear
  };
}
async function generatePayslipPdf(payrollId) {
  const payroll = await db_default.payroll.findUnique({
    where: { id: payrollId },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true, department: { select: { name: true } } } } }
  });
  if (!payroll) throw { status: 404, message: "Payroll not found" };
  const doc = new import_pdfkit.default({ size: "A4", margin: 50 });
  const chunks = [];
  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    doc.fontSize(20).text("PAYSLIP", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Period: ${monthNames[payroll.month - 1]} ${payroll.year}`, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(14).text("Greenwood School", { align: "center" });
    doc.fontSize(10).text("123 Education Lane, City", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(12).text("Employee Details", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Name: ${payroll.staff.name}`);
    doc.text(`Employee ID: ${payroll.staff.employeeId}`);
    doc.text(`Designation: ${payroll.staff.designation ?? "\u2014"}`);
    doc.text(`Department: ${payroll.staff.department?.name ?? "\u2014"}`);
    doc.moveDown(1);
    doc.fontSize(12).text("Salary Breakdown", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    const rows = [
      ["Basic Pay", `\u09F3${payroll.basicPay.toLocaleString()}`],
      ["Allowances", `\u09F3${payroll.allowances.toLocaleString()}`],
      ["Deductions", `-\u09F3${payroll.deductions.toLocaleString()}`],
      ["Attendance Days", String(payroll.attendanceDays)],
      ["Leave Days", String(payroll.leaveDays)],
      ["Net Salary", `\u09F3${payroll.netSalary.toLocaleString()}`]
    ];
    rows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });
    doc.moveDown(1);
    doc.text(`Status: ${payroll.status}`);
    doc.text(`Generated: ${new Date(payroll.createdAt).toLocaleDateString()}`);
    doc.end();
  });
}

// src/modules/hr/hr.controller.ts
var HRController = class {
  // ─── Dashboard ──────────────────────────────────────────────────
  async getDashboardStats(req, res, next) {
    try {
      const data = await getHRDashboardStats();
      sendSuccess(res, data, "Dashboard stats fetched");
    } catch (err) {
      next(err);
    }
  }
  // ─── Departments ────────────────────────────────────────────────
  async createDepartment(req, res, next) {
    try {
      const dept = await createDepartment(req.body);
      sendSuccess(res, dept, "Department created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllDepartments(req, res, next) {
    try {
      const departments = await findAllDepartments();
      sendSuccess(res, departments, "Departments fetched");
    } catch (err) {
      next(err);
    }
  }
  async updateDepartment(req, res, next) {
    try {
      const dept = await updateDepartment(String(req.params.id), req.body);
      sendSuccess(res, dept, "Department updated");
    } catch (err) {
      next(err);
    }
  }
  async deleteDepartment(req, res, next) {
    try {
      const dept = await deleteDepartment(String(req.params.id));
      sendSuccess(res, dept, "Department deactivated");
    } catch (err) {
      next(err);
    }
  }
  // ─── Staff management ───────────────────────────────────────────
  async createStaff(req, res, next) {
    try {
      const staff = await createStaff(req.body, req.user.id);
      sendSuccess(res, staff, "Staff created successfully", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllStaff(req, res, next) {
    try {
      const data = await findAllStaff(req.query);
      sendSuccess(res, data, "Staff list fetched");
    } catch (err) {
      next(err);
    }
  }
  async findStaffById(req, res, next) {
    try {
      const staff = await findStaffById(String(req.params.id));
      sendSuccess(res, staff, "Staff fetched");
    } catch (err) {
      next(err);
    }
  }
  async updateStaff(req, res, next) {
    try {
      const staff = await updateStaff(String(req.params.id), req.body);
      sendSuccess(res, staff, "Staff updated");
    } catch (err) {
      next(err);
    }
  }
  async archiveStaff(req, res, next) {
    try {
      const staff = await archiveStaff(String(req.params.id));
      sendSuccess(res, staff, "Staff profile deactivated");
    } catch (err) {
      next(err);
    }
  }
  async restoreStaff(req, res, next) {
    try {
      const staff = await restoreStaff(String(req.params.id));
      sendSuccess(res, staff, "Staff profile restored");
    } catch (err) {
      next(err);
    }
  }
  async getStaffDirectory(req, res, next) {
    try {
      const directory = await getStaffDirectory();
      sendSuccess(res, directory, "Staff directory fetched");
    } catch (err) {
      next(err);
    }
  }
  // ─── Attendance management ──────────────────────────────────────
  async recordAttendance(req, res, next) {
    try {
      const record = await recordAttendance(req.body, req.user.id);
      sendSuccess(res, record, "Attendance recorded", 201);
    } catch (err) {
      next(err);
    }
  }
  async recordBulkAttendance(req, res, next) {
    try {
      const result = await recordBulkAttendance(req.body, req.user.id);
      sendSuccess(res, result, "Bulk attendance recorded");
    } catch (err) {
      next(err);
    }
  }
  async getStaffAttendance(req, res, next) {
    try {
      const { from, to } = req.query;
      const records = await getStaffAttendance(String(req.params.id), from, to);
      sendSuccess(res, records, "Attendance records fetched");
    } catch (err) {
      next(err);
    }
  }
  async getDailyAttendance(req, res, next) {
    try {
      const { date } = req.query;
      const result = await getDailyAttendance(date || (/* @__PURE__ */ new Date()).toISOString());
      sendSuccess(res, result, "Daily attendance fetched");
    } catch (err) {
      next(err);
    }
  }
  async getAttendanceMonthlySummary(req, res, next) {
    try {
      const { year, month } = req.query;
      const y = year ? parseInt(year) : (/* @__PURE__ */ new Date()).getFullYear();
      const m = month ? parseInt(month) : (/* @__PURE__ */ new Date()).getMonth() + 1;
      const summary = await getAttendanceMonthlySummary(y, m);
      sendSuccess(res, summary, "Monthly attendance summary fetched");
    } catch (err) {
      next(err);
    }
  }
  // ─── Leave management ───────────────────────────────────────────
  async createLeaveRequest(req, res, next) {
    try {
      const leave = await createLeaveRequest(req.body, req.user.id);
      sendSuccess(res, leave, "Leave request submitted", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllLeaveRequests(req, res, next) {
    try {
      const data = await findAllLeaveRequests(req.query);
      sendSuccess(res, data, "Leave requests fetched");
    } catch (err) {
      next(err);
    }
  }
  async approveLeaveRequest(req, res, next) {
    try {
      const leave = await approveLeaveRequest(String(req.params.id), req.body, req.user.id);
      sendSuccess(res, leave, req.body.approved ? "Leave approved" : "Leave rejected");
    } catch (err) {
      next(err);
    }
  }
  async getLeaveBalance(req, res, next) {
    try {
      const { year } = req.query;
      const balances = await getLeaveBalance(String(req.params.id), year ? parseInt(year) : void 0);
      sendSuccess(res, balances, "Leave balance fetched");
    } catch (err) {
      next(err);
    }
  }
  async initializeLeaveBalances(req, res, next) {
    try {
      const { year } = req.body;
      const y = year ?? (/* @__PURE__ */ new Date()).getFullYear();
      await initializeDefaultLeaveBalances(String(req.params.id), y);
      sendSuccess(res, null, "Leave balances initialized");
    } catch (err) {
      next(err);
    }
  }
  // ─── Payroll management ─────────────────────────────────────────
  async generatePayroll(req, res, next) {
    try {
      const payroll = await generatePayroll(req.body, req.user.id);
      sendSuccess(res, payroll, "Payroll generated", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllPayrolls(req, res, next) {
    try {
      const data = await findAllPayrolls(req.query);
      sendSuccess(res, data, "Payroll records fetched");
    } catch (err) {
      next(err);
    }
  }
  async getPayrollHistory(req, res, next) {
    try {
      const history = await getPayrollHistory(String(req.params.id));
      sendSuccess(res, history, "Payroll history fetched");
    } catch (err) {
      next(err);
    }
  }
  async markPayrollPaid(req, res, next) {
    try {
      const payroll = await markPayrollPaid(String(req.params.id));
      sendSuccess(res, payroll, "Payroll marked as paid");
    } catch (err) {
      next(err);
    }
  }
  async getPendingPayrolls(req, res, next) {
    try {
      const pending = await getPendingPayrolls();
      sendSuccess(res, pending, "Pending payrolls fetched");
    } catch (err) {
      next(err);
    }
  }
  async downloadPayslip(req, res, next) {
    try {
      const pdfBuffer = await generatePayslipPdf(String(req.params.id));
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="payslip-${req.params.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
  // ─── Performance Reviews ────────────────────────────────────────
  async createPerformanceReview(req, res, next) {
    try {
      const review = await createPerformanceReview(req.body, req.user.id);
      sendSuccess(res, review, "Performance review recorded", 201);
    } catch (err) {
      next(err);
    }
  }
  async findPerformanceReviews(req, res, next) {
    try {
      const reviews = await findPerformanceReviews(String(req.params.id));
      sendSuccess(res, reviews, "Performance reviews fetched");
    } catch (err) {
      next(err);
    }
  }
  // ─── Critical Actions ───────────────────────────────────────────
  async requestCriticalAction(req, res, next) {
    try {
      const action = await requestCriticalAction(req.body, req.user.id);
      sendSuccess(res, action, "Critical action requested", 201);
    } catch (err) {
      next(err);
    }
  }
  async findPendingCriticalActions(req, res, next) {
    try {
      const actions = await findPendingCriticalActions();
      sendSuccess(res, actions, "Pending critical actions fetched");
    } catch (err) {
      next(err);
    }
  }
  async findCriticalActionById(req, res, next) {
    try {
      const action = await findCriticalActionById(String(req.params.id));
      sendSuccess(res, action, "Critical action fetched");
    } catch (err) {
      next(err);
    }
  }
  async approveCriticalAction(req, res, next) {
    try {
      const action = await approveCriticalAction(
        String(req.params.id),
        req.user.id,
        req.body.reviewComment
      );
      sendSuccess(res, action, "Critical action approved");
    } catch (err) {
      next(err);
    }
  }
  async rejectCriticalAction(req, res, next) {
    try {
      const action = await rejectCriticalAction(
        String(req.params.id),
        req.user.id,
        req.body.reviewComment || "No comment provided"
      );
      sendSuccess(res, action, "Critical action rejected");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/hr/hr.routes.ts
var router18 = (0, import_express18.Router)();
var c10 = new HRController();
router18.use(authenticate);
router18.get("/dashboard", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.getDashboardStats.bind(c10));
router18.post("/departments", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.createDepartment.bind(c10));
router18.get("/departments", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c10.findAllDepartments.bind(c10));
router18.patch("/departments/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.updateDepartment.bind(c10));
router18.delete("/departments/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.deleteDepartment.bind(c10));
router18.post("/staff", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.createStaff.bind(c10));
router18.get("/staff", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c10.findAllStaff.bind(c10));
router18.get("/staff/directory", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c10.getStaffDirectory.bind(c10));
router18.get("/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c10.findStaffById.bind(c10));
router18.patch("/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.updateStaff.bind(c10));
router18.delete("/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.archiveStaff.bind(c10));
router18.patch("/staff/:id/restore", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c10.restoreStaff.bind(c10));
router18.post("/attendance", authorizeRoles("HR", "SCHOOL_ADMIN", "TEACHER"), c10.recordAttendance.bind(c10));
router18.post("/attendance/bulk", authorizeRoles("HR", "SCHOOL_ADMIN", "TEACHER"), c10.recordBulkAttendance.bind(c10));
router18.get("/attendance/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "TEACHER"), c10.getStaffAttendance.bind(c10));
router18.get("/attendance/daily", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.getDailyAttendance.bind(c10));
router18.get("/attendance/monthly-summary", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.getAttendanceMonthlySummary.bind(c10));
router18.post("/leave", authorizeRoles("HR", "SCHOOL_ADMIN", "TEACHER"), c10.createLeaveRequest.bind(c10));
router18.get("/leave", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.findAllLeaveRequests.bind(c10));
router18.patch("/leave/:id/approve", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.approveLeaveRequest.bind(c10));
router18.get("/leave/staff/:id/balance", authorizeRoles("HR", "SCHOOL_ADMIN", "TEACHER"), c10.getLeaveBalance.bind(c10));
router18.post("/leave/staff/:id/balance/init", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.initializeLeaveBalances.bind(c10));
router18.post("/payroll", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.generatePayroll.bind(c10));
router18.get("/payroll", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.findAllPayrolls.bind(c10));
router18.get("/payroll/pending", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.getPendingPayrolls.bind(c10));
router18.get("/payroll/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.getPayrollHistory.bind(c10));
router18.get("/payroll/:id/download", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.downloadPayslip.bind(c10));
router18.patch("/payroll/:id/mark-paid", authorizeRoles("HR", "SCHOOL_ADMIN", "ACCOUNTANT"), c10.markPayrollPaid.bind(c10));
router18.post("/performance", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.createPerformanceReview.bind(c10));
router18.get("/performance/staff/:id", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.findPerformanceReviews.bind(c10));
router18.post("/critical-actions", authorizeRoles("HR", "SCHOOL_ADMIN"), c10.requestCriticalAction.bind(c10));
router18.get("/critical-actions", authorizeRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), c10.findPendingCriticalActions.bind(c10));
router18.get("/critical-actions/:id", authorizeRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), c10.findCriticalActionById.bind(c10));
router18.patch("/critical-actions/:id/approve", authorizeRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), c10.approveCriticalAction.bind(c10));
router18.patch("/critical-actions/:id/reject", authorizeRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), c10.rejectCriticalAction.bind(c10));
var hr_routes_default = router18;

// src/modules/recruitment/recruitment.routes.ts
var import_express19 = require("express");

// src/modules/recruitment/recruitment.service.ts
init_db();
init_pagination_util();
async function createJobPosting(dto, actorId) {
  return db_default.jobPosting.create({
    data: {
      title: dto.title,
      departmentId: dto.departmentId,
      designation: dto.designation,
      vacancies: dto.vacancies,
      description: dto.description,
      requirements: dto.requirements,
      deadline: new Date(dto.deadline),
      createdBy: actorId
    },
    include: { department: { select: { id: true, name: true } } }
  });
}
async function findAllJobPostings(query) {
  const { page = "1", limit = "10", status, departmentId } = query;
  const where = {};
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  const { skip, take, meta } = await paginate(db_default.jobPosting, where, parseInt(page, 10), parseInt(limit, 10));
  const [postings, total] = await Promise.all([
    db_default.jobPosting.findMany({
      where,
      skip,
      take,
      include: {
        department: { select: { id: true, name: true, code: true } },
        applicants: { select: { id: true, name: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    db_default.jobPosting.count({ where })
  ]);
  return {
    postings: postings.map((p) => ({
      ...p,
      applicantCount: p.applicants.length,
      applicants: void 0
    })),
    meta: { ...meta, total }
  };
}
async function findJobPostingById(id) {
  const posting = await db_default.jobPosting.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, code: true } },
      applicants: {
        include: {
          interviews: true,
          offers: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!posting) throw { status: 404, message: "Job posting not found" };
  return posting;
}
async function updateJobPosting(id, dto) {
  const posting = await db_default.jobPosting.findUnique({ where: { id } });
  if (!posting) throw { status: 404, message: "Job posting not found" };
  const data = { ...dto };
  if (dto.deadline) {
    data.deadline = new Date(dto.deadline);
  }
  return db_default.jobPosting.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } }
  });
}
async function closeJobPosting(id) {
  const posting = await db_default.jobPosting.findUnique({ where: { id } });
  if (!posting) throw { status: 404, message: "Job posting not found" };
  return db_default.jobPosting.update({
    where: { id },
    data: { status: "CLOSED" }
  });
}
async function createApplicant(dto) {
  const posting = await db_default.jobPosting.findUnique({ where: { id: dto.jobPostingId } });
  if (!posting) throw { status: 404, message: "Job posting not found" };
  return db_default.applicant.create({
    data: {
      jobPostingId: dto.jobPostingId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
      notes: dto.notes
    },
    include: {
      jobPosting: { select: { id: true, title: true, designation: true } }
    }
  });
}
async function findAllApplicants(query) {
  const { page = "1", limit = "10", jobPostingId, status } = query;
  const where = {};
  if (jobPostingId) where.jobPostingId = jobPostingId;
  if (status) where.status = status;
  const { skip, take, meta } = await paginate(db_default.applicant, where, parseInt(page, 10), parseInt(limit, 10));
  const [applicants, total] = await Promise.all([
    db_default.applicant.findMany({
      where,
      skip,
      take,
      include: {
        jobPosting: { select: { id: true, title: true, designation: true } },
        interviews: { orderBy: { scheduledAt: "desc" } },
        offers: true
      },
      orderBy: { createdAt: "desc" }
    }),
    db_default.applicant.count({ where })
  ]);
  return { applicants, meta: { ...meta, total } };
}
async function updateApplicantStatus(id, dto) {
  const applicant = await db_default.applicant.findUnique({ where: { id } });
  if (!applicant) throw { status: 404, message: "Applicant not found" };
  return db_default.applicant.update({
    where: { id },
    data: { status: dto.status },
    include: { jobPosting: { select: { id: true, title: true } } }
  });
}
async function findApplicantById(id) {
  const applicant = await db_default.applicant.findUnique({
    where: { id },
    include: {
      jobPosting: { select: { id: true, title: true, designation: true, department: { select: { id: true, name: true } } } },
      interviews: { orderBy: { scheduledAt: "desc" } },
      offers: true
    }
  });
  if (!applicant) throw { status: 404, message: "Applicant not found" };
  return applicant;
}
async function createInterview(dto) {
  const applicant = await db_default.applicant.findUnique({ where: { id: dto.applicantId } });
  if (!applicant) throw { status: 404, message: "Applicant not found" };
  return db_default.interview.create({
    data: {
      applicantId: dto.applicantId,
      scheduledAt: new Date(dto.scheduledAt),
      location: dto.location,
      interviewers: dto.interviewers ?? []
    },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } }
        }
      }
    }
  });
}
async function updateInterview(id, dto) {
  const interview = await db_default.interview.findUnique({ where: { id } });
  if (!interview) throw { status: 404, message: "Interview not found" };
  const data = { ...dto };
  if (dto.scheduledAt) {
    data.scheduledAt = new Date(dto.scheduledAt);
  }
  return db_default.interview.update({
    where: { id },
    data,
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } }
        }
      }
    }
  });
}
async function createOffer(dto) {
  const applicant = await db_default.applicant.findUnique({ where: { id: dto.applicantId } });
  if (!applicant) throw { status: 404, message: "Applicant not found" };
  return db_default.offer.create({
    data: {
      applicantId: dto.applicantId,
      position: dto.position,
      departmentId: dto.departmentId,
      salary: dto.salary,
      joiningDate: new Date(dto.joiningDate),
      validUntil: new Date(dto.validUntil),
      terms: dto.terms
    },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } }
        }
      }
    }
  });
}
async function findOfferById(id) {
  const offer = await db_default.offer.findUnique({
    where: { id },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true, department: { select: { id: true, name: true } } } }
        }
      }
    }
  });
  if (!offer) throw { status: 404, message: "Offer not found" };
  return offer;
}
async function acceptOffer(id) {
  const offer = await db_default.offer.findUnique({
    where: { id },
    include: { applicant: true }
  });
  if (!offer) throw { status: 404, message: "Offer not found" };
  if (offer.status === "ACCEPTED") throw { status: 400, message: "Offer already accepted" };
  const updatedOffer = await db_default.offer.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      acceptedAt: /* @__PURE__ */ new Date()
    }
  });
  await db_default.applicant.update({
    where: { id: offer.applicantId },
    data: { status: "ACCEPTED" }
  });
  await db_default.jobPosting.update({
    where: { id: offer.applicant.jobPostingId },
    data: { status: "FILLED" }
  });
  return updatedOffer;
}
async function rejectOffer(id) {
  const offer = await db_default.offer.findUnique({ where: { id } });
  if (!offer) throw { status: 404, message: "Offer not found" };
  return db_default.offer.update({
    where: { id },
    data: { status: "DECLINED" }
  });
}
async function createDesignationSalary(dto) {
  return db_default.designationSalary.create({
    data: {
      designation: dto.designation,
      departmentId: dto.departmentId,
      basicPay: dto.basicPay,
      allowances: dto.allowances ?? 0,
      deductions: dto.deductions ?? 0
    },
    include: { department: { select: { id: true, name: true } } }
  });
}
async function findAllDesignationSalaries() {
  return db_default.designationSalary.findMany({
    include: { department: { select: { id: true, name: true, code: true } } },
    orderBy: { designation: "asc" }
  });
}
async function getDesignationSalary(designation) {
  return db_default.designationSalary.findFirst({
    where: { designation: { equals: designation, mode: "insensitive" } },
    include: { department: { select: { id: true, name: true } } }
  });
}
async function getRecruitmentDashboardStats() {
  const [totalPostings, openPostings, totalApplicants, shortlisted, offersSent, offersAccepted] = await Promise.all([
    db_default.jobPosting.count(),
    db_default.jobPosting.count({ where: { status: "OPEN" } }),
    db_default.applicant.count(),
    db_default.applicant.count({ where: { status: "SHORTLISTED" } }),
    db_default.applicant.count({ where: { status: "OFFERED" } }),
    db_default.applicant.count({ where: { status: "ACCEPTED" } })
  ]);
  return {
    totalPostings,
    openPostings,
    totalApplicants,
    shortlisted,
    offersSent,
    offersAccepted
  };
}

// src/modules/recruitment/recruitment.controller.ts
var RecruitmentController = class {
  async getDashboardStats(req, res, next) {
    try {
      const data = await getRecruitmentDashboardStats();
      sendSuccess(res, data, "Recruitment stats fetched");
    } catch (err) {
      next(err);
    }
  }
  // ─── Job Postings ───────────────────────────────────────────────
  async createJobPosting(req, res, next) {
    try {
      const posting = await createJobPosting(req.body, req.user.id);
      sendSuccess(res, posting, "Job posting created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllJobPostings(req, res, next) {
    try {
      const data = await findAllJobPostings(req.query);
      sendSuccess(res, data, "Job postings fetched");
    } catch (err) {
      next(err);
    }
  }
  async findJobPostingById(req, res, next) {
    try {
      const posting = await findJobPostingById(String(req.params.id));
      sendSuccess(res, posting, "Job posting fetched");
    } catch (err) {
      next(err);
    }
  }
  async updateJobPosting(req, res, next) {
    try {
      const posting = await updateJobPosting(String(req.params.id), req.body);
      sendSuccess(res, posting, "Job posting updated");
    } catch (err) {
      next(err);
    }
  }
  async closeJobPosting(req, res, next) {
    try {
      const posting = await closeJobPosting(String(req.params.id));
      sendSuccess(res, posting, "Job posting closed");
    } catch (err) {
      next(err);
    }
  }
  // ─── Applicants ────────────────────────────────────────────────
  async createApplicant(req, res, next) {
    try {
      const applicant = await createApplicant(req.body);
      sendSuccess(res, applicant, "Applicant created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllApplicants(req, res, next) {
    try {
      const data = await findAllApplicants(req.query);
      sendSuccess(res, data, "Applicants fetched");
    } catch (err) {
      next(err);
    }
  }
  async findApplicantById(req, res, next) {
    try {
      const applicant = await findApplicantById(String(req.params.id));
      sendSuccess(res, applicant, "Applicant fetched");
    } catch (err) {
      next(err);
    }
  }
  async updateApplicantStatus(req, res, next) {
    try {
      const applicant = await updateApplicantStatus(String(req.params.id), req.body);
      sendSuccess(res, applicant, "Applicant status updated");
    } catch (err) {
      next(err);
    }
  }
  // ─── Interviews ────────────────────────────────────────────────
  async createInterview(req, res, next) {
    try {
      const interview = await createInterview(req.body);
      sendSuccess(res, interview, "Interview scheduled", 201);
    } catch (err) {
      next(err);
    }
  }
  async updateInterview(req, res, next) {
    try {
      const interview = await updateInterview(String(req.params.id), req.body);
      sendSuccess(res, interview, "Interview updated");
    } catch (err) {
      next(err);
    }
  }
  // ─── Offers ────────────────────────────────────────────────────
  async createOffer(req, res, next) {
    try {
      const offer = await createOffer(req.body);
      sendSuccess(res, offer, "Offer created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findOfferById(req, res, next) {
    try {
      const offer = await findOfferById(String(req.params.id));
      sendSuccess(res, offer, "Offer fetched");
    } catch (err) {
      next(err);
    }
  }
  async acceptOffer(req, res, next) {
    try {
      const offer = await acceptOffer(String(req.params.id));
      sendSuccess(res, offer, "Offer accepted");
    } catch (err) {
      next(err);
    }
  }
  async rejectOffer(req, res, next) {
    try {
      const offer = await rejectOffer(String(req.params.id));
      sendSuccess(res, offer, "Offer rejected");
    } catch (err) {
      next(err);
    }
  }
  // ─── Designation Salaries ──────────────────────────────────────
  async createDesignationSalary(req, res, next) {
    try {
      const salary = await createDesignationSalary(req.body);
      sendSuccess(res, salary, "Designation salary created", 201);
    } catch (err) {
      next(err);
    }
  }
  async findAllDesignationSalaries(req, res, next) {
    try {
      const salaries = await findAllDesignationSalaries();
      sendSuccess(res, salaries, "Designation salaries fetched");
    } catch (err) {
      next(err);
    }
  }
  async getDesignationSalary(req, res, next) {
    try {
      const salary = await getDesignationSalary(String(req.params.designation));
      sendSuccess(res, salary, "Designation salary fetched");
    } catch (err) {
      next(err);
    }
  }
};

// src/modules/recruitment/recruitment.routes.ts
var router19 = (0, import_express19.Router)();
var c11 = new RecruitmentController();
router19.use(authenticate);
router19.get("/dashboard", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.getDashboardStats.bind(c11));
router19.post("/jobs", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.createJobPosting.bind(c11));
router19.get("/jobs", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findAllJobPostings.bind(c11));
router19.get("/jobs/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findJobPostingById.bind(c11));
router19.patch("/jobs/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.updateJobPosting.bind(c11));
router19.patch("/jobs/:id/close", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.closeJobPosting.bind(c11));
router19.post("/applicants", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.createApplicant.bind(c11));
router19.get("/applicants", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findAllApplicants.bind(c11));
router19.get("/applicants/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findApplicantById.bind(c11));
router19.patch("/applicants/:id/status", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.updateApplicantStatus.bind(c11));
router19.post("/interviews", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.createInterview.bind(c11));
router19.patch("/interviews/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.updateInterview.bind(c11));
router19.post("/offers", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.createOffer.bind(c11));
router19.get("/offers/:id", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findOfferById.bind(c11));
router19.patch("/offers/:id/accept", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.acceptOffer.bind(c11));
router19.patch("/offers/:id/reject", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.rejectOffer.bind(c11));
router19.post("/designation-salaries", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN"), c11.createDesignationSalary.bind(c11));
router19.get("/designation-salaries", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.findAllDesignationSalaries.bind(c11));
router19.get("/designation-salaries/:designation", authorizeRoles("HR", "SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"), c11.getDesignationSalary.bind(c11));
var recruitment_routes_default = router19;

// src/routes/index.ts
var router20 = import_express20.default.Router();
router20.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});
router20.use("/auth", auth_route_default);
router20.use("/students", students_route_default);
router20.use("/subjects", subject_router_default);
router20.use("/classes", class_route_default);
router20.use("/exams", exam_route_default);
router20.use("/attendance", attendacne_router_default);
router20.use("/teachers", teacher_routes_default);
router20.use("/results", result_router_default);
router20.use("/admission", admission_routes_default);
router20.use("/fees", router_default);
router20.use("/teaching", teachingApplication_routes_default);
router20.use("/notices", notice_route_default);
router20.use("/timetable", timetable_routes_default);
router20.use("/homework", howework_routes_default);
router20.use("/parents", parents_routes_default);
router20.use("/notifications", notifictaion_routes_default);
router20.use("/super-admin", superAdmin_route_default);
router20.use("/hr", hr_routes_default);
router20.use("/recruitment", recruitment_routes_default);
var routes_default = router20;

// src/index.ts
import_dotenv.default.config();
var app = (0, import_express21.default)();
var server = import_http.default.createServer(app);
initSocket(server);
app.use((0, import_helmet.default)());
var allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001"
].filter((origin) => Boolean(origin));
var allowedOriginSet = new Set(allowedOrigins);
var isLocalhost = (origin) => origin.includes("localhost") || origin.includes("127.0.0.1");
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOriginSet.has(origin) || isLocalhost(origin)) {
        return callback(null, true);
      }
      logger_default.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    logger_default.info(`[REQUEST] ${req.method} ${req.path}`);
    next();
  });
}
app.use(import_express21.default.json({ limit: "1mb" }));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SMS Backend API is running",
    health: "/api/v1/health"
  });
});
app.use("/api/v1", routes_default);
app.use(errorMiddleware);
var PORT = process.env.PORT || 5e3;
server.listen(PORT, () => {
  console.log(`
 Server running on port ${PORT}
`);
});
/*! Bundled license information:

media-typer/index.js:
  (*!
   * media-typer
   * Copyright(c) 2014 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

type-is/index.js:
  (*!
   * type-is
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/

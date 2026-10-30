/**
 * @typedef {{code: string, anno: qx.core.Object}} AnnoWithCode
 */
qx.Class.define("qx.tool.compiler.meta.AnnoUtil", {
  type: "static",

  statics: {
    /**
     * Evaluates an annotation expression found in the meta database to an actual object
     * @param {string} expr 
     * @returns {qx.core.Object|null}
     */
    evalAnno(expr) {
      try {
        var val = eval(expr);
        return val;
      } catch (e) {
        return null;
      }
    },

    /**
     * Like qx.Annotation.getOwnClass uses meta database instead of reflection
     * @param {qx.tool.compiler.meta.MetaDatabase} metaDb 
     * @param {string} classname 
     * @param {new () => qx.core.Object} anno 
     * @returns {AnnoWithCode[]} An array of evaluated annotation objects with their raw code
     */
    getOwnClass(metaDb, classname, anno) {
      const AnnoUtil = qx.tool.compiler.meta.AnnoUtil;
      let classMeta = metaDb.getMetaData(classname);
      let out = [];
      for (let code of Object.values(classMeta.annotation || {})) {
        let a = AnnoUtil.evalAnno(code);
        if (!a) {
          continue;
        }
        if (a.constructor === anno) {
          out.push({ code, anno: a });
        }
      }
      return out;
    },

    /**
     * Like qx.Annotation.getMember uses meta database instead of reflection
     * @param {qx.tool.compiler.meta.MetaDatabase} metaDb 
     * @param {string} classname 
     * @param {string} memberName 
     * @param {new () => qx.core.Object} anno Annotation class constructor
     * @returns {AnnoWithCode[]} An array of objects containing the raw code for the annotation and the evaluated annotation object
     */
    getMember(metaDb, classname, memberName, anno) {      
      const AnnoUtil = qx.tool.compiler.meta.AnnoUtil;

      let classMeta;
      let out = [];
      for (;!!classname; classname = classMeta.superClass) {
        classMeta = metaDb.getMetaData(classname);
        if (!classMeta) {
          break;
        }
        let memberAnnos = classMeta.members?.[memberName]?.annotation || [];
        for (let memberAnnoExpr of memberAnnos) {
          let memberAnno = AnnoUtil.evalAnno(memberAnnoExpr);
          if (memberAnno && memberAnno.constructor === anno) {
            out.push({code: memberAnnoExpr, anno: memberAnno});
          }
        }
      }
      return out;
    }
  }
});

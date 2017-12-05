/*
* Вспомогательные функции для работы с файлами.
* */
class FileUtils {
    constructor() {}

    getUrlForInputFile (file) {
        if (!file) {
            throw new Error('FILE_NOT_FOUND');
        }

        var fileURL = URL.createObjectURL(file);
        return fileURL;
    }
  
  	downloadJson(data, name) {
      	let pointsJson = JSON.stringify(data);
        var blob = new Blob([pointsJson], {type: "application/json"});
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = name + ".json";
        document.body.appendChild(a);
        a.click();
      	document.body.removeChild(a);
    }
}

export default new FileUtils();

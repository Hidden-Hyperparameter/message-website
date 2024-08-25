import LanguageEN from "../languages/en.json";
import LanguageZH from "../languages/zh.json";
class LanguageSwitcher {
    constructor() {
        this.language = 'en'; // Default language is English
    }

    switchLanguage(language) {
        if (language === 'en' || language === 'zh') {
            this.language = language;
            console.log(`Language switched to ${language}`);
        } else {
            console.log(`Unsupported language: ${language}`);
        }
    }

    Trans(message) {
        if (this.language === 'en') {
            if (LanguageEN[message] !== undefined) return LanguageEN[message];
            else return message;
        }
        else if (this.language === 'zh') {
            if (LanguageZH[message] !== undefined) return LanguageZH[message];
            else if (LanguageEN[message] !== undefined) return LanguageEN[message];
            else return message;
        }
        else {
            console.log(`Unsupported language: ${this.language}`);
            return message;
        }
    }
}

var ls = new LanguageSwitcher();

export {LanguageSwitcher, ls};
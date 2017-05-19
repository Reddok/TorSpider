const strategies = {
    liveinternet: (siteUrl, referrer, screen) => {
        const base = "http://counter.yadro.ru/hit",
            referrerStr = "?t50.2;r" + escape(referrer),
            scrennStr = ";s"+screen.width+"*"+screen.height+"*" + screen.colorDepth,
            site = ";u"+escape(siteUrl)+ ";"+Math.random();
        return base + referrerStr + scrennStr + site;
    }
};

module.exports = (names=[]) => {
    return names.reduce( (arr, name) => {
        strategies[name] && arr.push(strategies[name]);
        return arr;
    }, []);
};


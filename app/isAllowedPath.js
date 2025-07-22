function isAllowedPath(pathName) {
    if (typeof pathName !== 'string') {
        return false; // 文字列型でない場合はfalse
    }
    return pathName.toLowerCase().startsWith('nas3');
}
import { extend } from './umi-request'
import BASE_URL from './base'
import { message, Modal } from 'antd'
import { getCookie } from './auth'
import whiteList from './whiteList'

const request = extend({
    timeout: 1500000,
})
// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
    if (url.indexOf('upload.58cdn') > -1) {
        return { options }
    }
    return {
        options: {
            ...options,
            interceptors: true,
            headers: {
                saasCookieId: getCookie(),
                // Accept: 'application/json, text/plain, */*',
                Authorization: 'Bearer ' + getCookie(),
                // 'Content-Type': 'application/x-www-form-urlencoded',
                ...options.headers,
            },
        },
    }
})

// response拦截器, 处理response
request.interceptors.response.use(async response => {
    const pattern = new RegExp(`${whiteList.join('|')}`)
    if (pattern.test(response.url)) {
        return response
    }

    const data = await response.clone().json()
    data.result = data.result || data.data
    data.msg = data.msg || data.message
    if (data.code === 0 || data.state === 200) {
        return data.result
    } else {
        message.error(data.msg)
        return false
    }
})

export default {
    get<T>(url: string, params?: {}, base = 'SAAS_API', cache = false): Promise<T> {
        let headers = {}
        if (!cache) {
            // 不允许缓存
            headers = {
                Pragma: 'no-cache',
                'Cache-Control': 'must-revalidate,no-cache,no-store',
                Expires: 0,
            }
        }
        return new Promise((resolve, reject) => {
            request
                .get(`${BASE_URL[base]}${url}`, {
                    params,
                    headers,
                })
                .then(res => {
                    res !== false ? resolve(res) : reject(res)
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    postJson<T>(url: string, data?: {}, base = 'SAAS_API'): Promise<T> {
        return new Promise((resolve, reject) => {
            request
                .post(`${BASE_URL[base]}${url}`, {
                    data,
                })
                .then(res => {
                    res !== false ? resolve(res) : reject(res)
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    postForm<T>(url: string, data?: {}, base = 'SAAS_API'): Promise<T> {
        return new Promise((resolve, reject) => {
            request
                .post(`${BASE_URL[base]}${url}`, {
                    data,
                    requestType: 'form',
                })
                .then(res => {
                    res !== false ? resolve(res) : reject(res)
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    upload<T>(url: string, data?: {}, base = 'SAAS_API'): Promise<T> {
        return new Promise((resolve, reject) => {
            request
                .post(`${BASE_URL[base]}${url}`, { data })
                .then(res => {
                    res !== false ? resolve(res) : reject(res)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    download(url: string, data: {}, fileName: string, base = 'SAAS_API') {
        return new Promise<void>((resolve, reject) => {
            request
                .post(`${BASE_URL[base]}${url}`, {
                    data,
                    responseType: 'arrayBuffer',
                })
                .then(res => {
                    const blob = new Blob([res], {
                        type: 'application/vnd.ms-excel',
                    })
                    //@ts-ignore
                    if (window.navigator.msSaveBlob) {
                        try {
                            if (fileName) {
                                fileName = fileName.indexOf('.xlsx') >= 0 || fileName.indexOf('.xls') >= 0 ? fileName : fileName + '.xls'
                            }
                            //@ts-ignore
                            window.navigator.msSaveBlob(blob, fileName)
                            resolve()
                        } catch (e) {
                            console.log(e)
                        }
                    } else {
                        let link = document.createElement('a')
                        document.body.appendChild(link)
                        link.href = window.URL.createObjectURL(blob)
                        if (fileName) {
                            link.download = fileName.indexOf('.xlsx') >= 0 || fileName.indexOf('.xls') >= 0 ? fileName : fileName + '.xls'
                        }
                        link.click()
                        document.body.removeChild(link)
                        resolve()
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    //@ts-ignore
    printPdfFormBody(url, data: any = {}, template, callback, noTip, base = 'SAAS_API') {
        /** Template dupex 设置双面打印 0 不双面打印 1 自动 2 手动 orient 设置打印方向 0 打印方向由操作者自行选择或按打印机缺省设置 1 纵(正)向打印，固定纸张 2 横向打印，固定纸张 3 纵(正)向打印，宽度固定，高度按打印内容的高度自适应 */
        return new Promise((resolve, reject) => {
            request
                .post(`${BASE_URL[base]}${url}`, {
                    data,
                    responseType: 'blob',
                })
                .then(res => {
                    if (res.type.indexOf('pdf') > -1) {
                        if (template.printMode === 2 || data.useClodop) {
                            // @ts-ignore
                            if (!LODOP.ADD_PRINT_PDF) {
                                Modal.info({
                                    title: '提示',
                                    content: '该模板打印需要升级打印插件，请从用户头像点击插件下载，安装最新的打印插件',
                                    onOk() {},
                                })
                                return
                            }

                            let reader = new FileReader()
                            reader.onload = function (event) {
                                //@ts-ignore
                                let base64: any = event.target.result
                                base64 = base64.replace('data:application/pdf;base64,', '')
                                // @ts-ignore
                                const LODOP = getLodop()
                                LODOP.PRINT_INIT('驾校通新打印功能')

                                LODOP.SET_PRINT_PAGESIZE(template.orient, template.pageWidth + 'mm', template.pageHeight + 'mm', '')
                                LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1) // 横向时的正向显示
                                LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', base64)

                                //设置是否双面打印
                                if (template.duplex) {
                                    if ([0, 1, 2, 3].indexOf(template.duplex) >= 0) {
                                        // 0 - 不控制 1- 不双面 2- 双面(长边装订) 3- 小册子双面(短边装订_长边水平)
                                        LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 2)
                                    } else if (template.duplex === 4) {
                                        LODOP.SET_PRINT_MODE('DOUBLE_SIDED_PRINT', true)
                                    }
                                }

                                // LODOP.ADD_PRINT_PDF(0, 0, '60%', '60%', base64)
                                // LODOP.SET_PRINT_STYLEA(0, 'PDFScalMode', 1)
                                // LODOP.SET_PRINT_PAGESIZE(0, 0, 0, '')
                                //设置打印成功回调（真的打印了）
                                if (LODOP.CVERSION && callback) {
                                    //注册打印成功回调函数
                                    //@ts-ignore
                                    LODOP.On_Return = function (TaskID, Value) {
                                        if (Value && Value > 0) {
                                            callback(Value)
                                        }
                                    }
                                }

                                //设置预览方式
                                switch (template.printType) {
                                    case 1:
                                    case 2:
                                    case 3:
                                        LODOP.PREVIEW()
                                        break
                                    case 4:
                                        LODOP.PRINT()
                                        break
                                    default:
                                        LODOP.PREVIEW()
                                }
                            }

                            reader.readAsDataURL(res)
                        } else {
                            let iframe: any = document.getElementById('print_pdf_iframe')
                            if (!iframe) {
                                iframe = document.createElement('iframe')
                                iframe.id = 'print_pdf_iframe'
                                iframe.style.display = 'none'
                                document.body.appendChild(iframe)
                            }

                            iframe.src = window.URL.createObjectURL(res) //定义打印前事件

                            iframe.onload = function () {
                                //定义打印后事件
                                let beforePrint = function () {
                                    console.log('beforePrint')
                                }
                                let afterPrint = function () {
                                    console.log('afterPrint')
                                }

                                if ('matchMedia' in iframe.contentWindow) {
                                    //@ts-ignore
                                    iframe.contentWindow.matchMedia('print').addListener(function (media) {
                                        //do before-printing stuff
                                        if (media.matches) {
                                            beforePrint()
                                        } else {
                                            afterPrint()
                                        }
                                    })
                                } else {
                                    iframe.contentWindow.onbeforeprint = beforePrint //打印后事件

                                    iframe.contentWindow.onafterprint = afterPrint
                                }

                                iframe.contentWindow.print()
                            }
                            iframe.onreadystatechange = function () {
                                if (iframe.readyState === 'complete') {
                                    console.log('打印准备中..')
                                }
                            }
                        }
                    } else if (res.type.indexOf('json') > -1) {
                        let reader: any = new FileReader()
                        reader.onload = function () {
                            const response = JSON.parse(reader.result)
                            if (!noTip) {
                                if (response.code != 0) {
                                    message.error(response.message)
                                } else {
                                    message.success(response.message)
                                }
                            }
                        }
                        reader.readAsText(res)
                    } else if (!noTip) {
                        message.error('打印服务异常，请稍后重试！')
                    }
                    // @ts-ignore
                    resolve()
                })
                .catch(error => {
                    reject(error)
                    if (!noTip) {
                        message.error('打印服务异常，请稍后重试！')
                    }
                })
        })
    },
    // 机器人 - 请求局域网视频资源请求方法
    postJsonWithAuth<T>(url: string, data?: {}): Promise<T> {
        let headers = {
                Authorization: 'Basic ' + btoa(decodeURIComponent('system:123456'))
            }
        return new Promise((resolve, reject) => {
            request.post(url, {
                data,
                headers
            }).then((res) => {
                res !== false ? resolve(res) : reject(res)
            }).catch((err) => {
                reject(err)
            })
        })
    },
}

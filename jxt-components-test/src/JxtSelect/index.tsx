/** 驾校通业务组件 - 下拉列表 wt */
import React, { CSSProperties, useEffect, useState } from 'react'
import { Select, Tag } from 'antd'
import useMergeValue from 'use-merge-value'
import { ComboBox, getComboBox } from '../services/combobox' // api请求
import _ from 'lodash'

export interface JxtSelectProps {
    placeholder?: string // 选择框默认文本
    allowClear?: boolean // 是否支持清除，默认true
    bordered?: boolean // 是否有边框，默认true
    isDefaultValue?: boolean // 是否默认选中的条目
    isShowSearch?: boolean // 是否可以搜索
    disabled?: boolean // 是否禁用
    mode?: 'multiple' | 'tags' // 设置 Select 的模式为多选或标签
    value?: string | string[] | number | number[] // 指定当前选中的条目
    //   onSearch?: (value?: string | string[] | number | number[]) => void; // 文本框值变化时回调
    onChange?: (value?: string | string[] | number | number[]) => void // 选中 option，或 input 的 value 变化时，调用此函数
    width?: string // 指定宽度
    api?: string // api 接口地址
    data?: object // 接口参数
    style?: CSSProperties
    optionDisable?: 1 | 2 | 3 // 禁用选项，是否可选，1.可选  2.禁用 3.不展示
    maxTagTextLength?: number // 默认显示5个字符
    optionFilter?: (item: ComboBox) => void // 数据筛选
    list?: ComboBox[]
    isShowType?: number // 0 默认值   1、班制展示车型  2、训练场展示科目 3、显示油气卡绑定 4、选择班主任
    dropdownMatchSelectWidth?: boolean
    showArrow?: boolean
    handleSearch?: (value?: string | string[] | number | number[]) => void
    maxTagCount?: number
    filterOption?: boolean | any //搜索时回调远程搜索要传false
    disableText?: string //禁用的文案
}

function valueVerify (id: any, value: any) {
    if (typeof value == 'number' || typeof value == 'string') {
        return value == id
    } else return _.indexOf(value, id) != -1
}

//校验选中值
function showVerify (isActive: number, optionDisable: any) {
    if (optionDisable == 1) return true
    else return isActive === 1
}

const JxtSelect: React.FC<JxtSelectProps> = props => {
    const [options, setOptions] = useState<ComboBox[]>()
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useMergeValue<string | string[] | number | number[] | undefined>(props.value, {
        value: props.value,
        onChange: props.onChange,
    })

    useEffect(() => {
        if (props.api) {
            // 加载下拉数据
            setLoading(true)

            getComboBox(props.api, props.data).then((res: any) => {
                setOptions(_.orderBy(res, 'isActive', 'desc'))
                if (props.isDefaultValue && res && res.length > 0) {
                    // 必填
                    // setValue(res[0].id)
                    setDefaultValue(res)
                }
                setLoading(false)
            })
        }
    }, [props.api])

    useEffect(() => {
        if (props.list && props.list.length > 0) {
            setOptions(_.orderBy(props.list, 'isActive', 'desc'))
            if (props.isDefaultValue && props.list && props.list.length > 0) {
                // 必填
                // setValue(props.list[0].id)
                setDefaultValue(props.list)
            }
        } else {
            setOptions(_.orderBy([], 'isActive', 'desc'))
        }
    }, [props.list])

    useEffect(() => {
        // 筛选触发，更新value
        if (value && props.optionFilter) {
            const list = options && _.filter(options, props.optionFilter)

            const ids = _.flatMap(list as ComboBox[], s => {
                return s.id
            })
            setValue(_.intersection((value as string[]) || [], ids) as string[])
        }
    }, [props.optionFilter])

    const setDefaultValue = (list: ComboBox[]) => {
        // 设置默认选中值
        try {
            list.forEach(element => {
                if (showVerify(element.isActive, props.optionDisable) && element.isDeleted == 0) {
                    if (element.children && element.children.length > 0) {
                        if (element.children.filter(x => showVerify(x.isActive, props.optionDisable) && x.isDeleted == 0).length > 0) {
                            setValue(element.children[0].id)
                            throw new Error('跳出循环')
                        }
                    } else {
                        setValue(element.id)
                        throw new Error('跳出循环')
                    }
                }
            })
        } catch (error) {}
    }

    return (
        <Select
            showSearch={props.isShowSearch}
            placeholder={props.placeholder}
            allowClear={props.allowClear}
            bordered={props.bordered}
            disabled={props.disabled}
            mode={props.mode}
            value={value === '' ? undefined : value}
            showArrow={props.showArrow}
            onChange={setValue}
            onSearch={props.handleSearch}
            style={{ width: props.width, ...props.style }}
            optionLabelProp='label'
            loading={loading}
            maxTagCount={props.maxTagCount}
            maxTagTextLength={props.maxTagTextLength}
            dropdownMatchSelectWidth={props.dropdownMatchSelectWidth}
            filterOption={props.filterOption}
            getPopupContainer={() => {
                return document.querySelector('.select-popup-container') || document.body
            }}
        >
            {options &&
                (_.filter(
                    _.filter(options, x => {
                        if (value) {
                            if (typeof value == 'number' || typeof value == 'string') {
                                return x.isDeleted == 0 || value == x.id
                            } else return x.isDeleted == 0 || _.indexOf(value, x.id) != -1
                        }
                        return x.isDeleted == 0
                    }),
                    props.optionFilter,
                ) as ComboBox[]).map(item => {
                    if (!item.children) {
                        return (
                            (props.optionDisable !== 3 || (props.optionDisable === 3 && (item.isActive == 1 || valueVerify(item.id, props.value)))) && (
                                <Select.Option key={item.id} value={item.id} label={item.name} disabled={(item.isActive == 0 && props.optionDisable !== 1) || item.disabled}>
                                    {props.isShowType === 0 && <span style={{ float: 'left' }}>{item.name}</span>}
                                    {props.isShowType === 1 && (
                                        <span style={{ float: 'left' }}>
                                            <Tag color='processing'>{item.customData.dicTrainType}</Tag>
                                            {item.name}
                                        </span>
                                    )}
                                    {props.isShowType === 2 &&
                                        (item.customData.course === 2 ? (
                                            <span style={{ float: 'left' }}>
                                                <Tag color='processing'>科目二</Tag>
                                                {item.name}
                                            </span>
                                        ) : (
                                            <span style={{ float: 'left' }}>
                                                <Tag color='success'>科目三</Tag>
                                                {item.name}
                                            </span>
                                        ))}
                                    {props.isShowType === 3 && (
                                        <>
                                            <span style={{ float: 'left' }}>{item.name}</span>
                                            {item.customData && item.customData.isBind == 1 && item.isActive == 1 && (
                                                <span style={{ float: 'right', paddingRight: 5, color: '#8492a6' }}>
                                                    <small>已绑定</small>
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {props.isShowType === 4 && (
                                        <>
                                            <span style={{ float: 'left' }}>
                                                {item.name}
                                                {item.customData?.userName ? `（${item.customData.userName}）` : null}
                                            </span>
                                            {item.customData && <span style={{ float: 'right', color: '#999999' }}>{item.customData?.studentCount || 0}学员</span>}
                                        </>
                                    )}
                                    {(item.isActive == 0 || item.isDeleted == 1) && (
                                        <span style={{ float: 'right', paddingRight: 5, color: '#8492a6' }}>
                                            <small>{item.isDeleted == 1 ? '删除' : props.disableText}</small>
                                        </span>
                                    )}
                                </Select.Option>
                            )
                        )
                    }

                    return (
                        <Select.OptGroup label={item.name} key={item.id}>
                            {(_.filter(
                                _.filter(item.children, x => {
                                    if (value) {
                                        if (typeof value == 'number' || typeof value == 'string') {
                                            return x.isDeleted == 0 || value == x.id
                                        } else return x.isDeleted == 0 || _.indexOf(value, x.id) != -1
                                    }
                                    return x.isDeleted == 0
                                }),
                                props.optionFilter,
                            ) as ComboBox[]).map(el => {
                                return (
                                    (props.optionDisable !== 3 || (props.optionDisable === 3 && (el.isActive == 1 || valueVerify(el.id, props.value)))) && (
                                        <Select.Option key={el.id} value={el.id} label={el.name} disabled={(el.isActive == 0 && props.optionDisable !== 1) || el.disabled}>
                                            {props.isShowType === 0 && <span style={{ float: 'left' }}>{el.name}</span>}
                                            {props.isShowType === 1 && (
                                                <span style={{ float: 'left' }}>
                                                    <Tag color='processing'>{el.customData.dicTrainType}</Tag>
                                                    {el.name}
                                                </span>
                                            )}
                                            {props.isShowType === 2 &&
                                                (el.customData.course === 2 ? (
                                                    <span style={{ float: 'left' }}>
                                                        <Tag color='processing'>科目二</Tag>
                                                        {el.name}
                                                    </span>
                                                ) : (
                                                    <span style={{ float: 'left' }}>
                                                        <Tag color='success'>科目三</Tag>
                                                        {el.name}
                                                    </span>
                                                ))}
                                            {props.isShowType === 3 && (
                                                <>
                                                    <span style={{ float: 'left' }}>{item.name}</span>
                                                    {item.customData && item.customData.isBind == 1 && item.isActive == 1 && (
                                                        <span style={{ float: 'right', paddingRight: 5, color: '#8492a6' }}>
                                                            <small>已绑定</small>
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {(el.isActive == 0 || el.isDeleted == 1) && (
                                                <span style={{ float: 'right', paddingRight: 5, color: '#8492a6' }}>
                                                    <small>{el.isDeleted == 1 ? '删除' : props.disableText}</small>
                                                </span>
                                            )}
                                        </Select.Option>
                                    )
                                )
                            })}
                        </Select.OptGroup>
                    )
                })}
        </Select>
    )
}

JxtSelect.defaultProps = {
    placeholder: '请选择',
    allowClear: true,
    isShowSearch: false,
    bordered: true,
    width: '100%',
    optionDisable: 1,
    isShowType: 0,
    isDefaultValue: false,
    maxTagTextLength: 5,
    data: {},
    dropdownMatchSelectWidth: false,
    showArrow: true,
    maxTagCount: 1,
    disableText: '禁用',
    filterOption: (input, option) => {
        if (option?.options) {
            // 分组，组名不筛选
            return false
        }
        if (option?.props) {
            return option?.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        if (option?.label) {
            return (
                option?.label
                    .toString()
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
            )
        }
        return false
    },
}
export default JxtSelect

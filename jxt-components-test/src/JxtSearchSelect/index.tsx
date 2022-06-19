import { Select } from 'antd'
import React, { useEffect, useState } from 'react'
import useMergeValue from 'use-merge-value'
import { ComboBox, getComboBox } from '../services/combobox'

const { Option } = Select

interface JxtSearchSelectProps {
    value?: string | string[] // 指定当前选中的条目
    placeholder?: string
    mode?: 'tags' | 'multiple' | undefined
    disabled?: boolean
    labelInValue?: boolean
    api?: string
    searchKey?: string
    onChange?: (value?: string | string[] | number | number[]) => void // 选中 option，或 input 的 value 变化时，调用此函数
    ids?: Array<string>
    requestParam?: object //请求接口的参数
}

const data: ComboBox[] = []

const JxtSearchSelect: React.FC<JxtSearchSelectProps> = props => {
    const { placeholder, mode, disabled, ids, api = '/api/per/user/combobox', searchKey = 'keyword', labelInValue = false, requestParam } = props
    const [value, setValue] = useMergeValue<string | string[] | number | number[] | undefined>(props.value, {
        value: props.value,
        onChange: props.onChange,
    })
    const [list, setList] = useState(data)
    let timeOut: any
    let currentValue: string

    const handleGetStaffSelectImmediate = async () => {
        const res = await getComboBox(api, { ids, ...requestParam })
        setList(res)
    }

    useEffect(() => {
        if (ids && ids.length > 0) {
            handleGetStaffSelectImmediate()
        }
    }, [ids])

    const handleGetStaffSelect = async (data: string | string[]) => {
        let param = {}
        param[searchKey] = data
        if (timeOut) {
            clearTimeout(timeOut)
            timeOut = null
        }
        currentValue = JSON.stringify(data)
        timeOut = setTimeout(async () => {
            const res = await getComboBox(api, { ...param, ...requestParam })
            if (currentValue === JSON.stringify(data)) {
                setList(res)
            }
        }, 300)
        // const res = await getComboBox(api, param)
        // setList(res)
    }
    useEffect(() => {
        if ((!!props.value && !list.length) || requestParam) {
            // if (props.value instanceof Array) {
            handleGetStaffSelect(props.value)
            // } else {
            //     handleGetStaffSelect(props.value.split(','))
            // }
        }
    }, [props.value, requestParam])

    // useEffect(() => {
    //     if (requestParam) {
    //         handleGetStaffSelect()
    //     }
    // }, [requestParam])

    const handleFocus = () => {
        if (!list.length) {
            handleGetStaffSelect('')
        }
    }

    const handleSearch = async (val: string) => {
        handleGetStaffSelect(val)
    }

    const options = list.map(d => (
        <Option key={d.id} value={d.id}>
            {d.name} -k
        </Option>
    ))
    return (
        <Select
            mode={mode}
            showSearch
            labelInValue={labelInValue}
            allowClear
            value={value}
            placeholder={placeholder}
            defaultActiveFirstOption={false}
            showArrow
            filterOption={false}
            onSearch={handleSearch}
            onChange={setValue}
            onFocus={handleFocus}
            notFoundContent={null}
            maxTagCount={1}
            disabled={disabled}
        >
            {options}
        </Select>
    )
}

JxtSearchSelect.defaultProps = {
    placeholder: '介绍人',
    mode: undefined,
    disabled: false,
    searchKey: 'keyword',
    ids: [],
}

export default JxtSearchSelect

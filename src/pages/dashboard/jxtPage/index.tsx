// import useMergeValue from 'use-merge-value'
// import qs from 'qs'
// import 'isomorphic-fetch'
import { useState, useEffect } from 'react'
import { Row, Col, Form } from 'antd'
import { ComboBox, getComboBox } from '../../../services/combobox'

import { JxtSelect, JxtSearchSelect } from 'jxt-components-test'

// console.log('JxtPage', qs)
const { Item } = Form

const JxtTest = () => {
    const [form] = Form.useForm()

    // 培训车型
    const [carTypeList, setCarTypeList] = useState<ComboBox[]>([])

    useEffect(() => {
        getComboBox('/api/combobox/enum', { enumName: 'cartype' }).then(res => {
            setCarTypeList(res)
        })
    }, [])

    return (
        <div>
            <Row>
                <div style={{ marginBottom: 30 }}>test-lib</div>
            </Row>
            <Row gutter={10}>
                <Form form={form} autoComplete='off' colon={false} layout='inline' style={{ width: '100%' }} onFinish={e => {}}>
                    <Col span={3}>
                        <Item name='name'>
                            <JxtSearchSelect api='/api/combobox/getCarList' placeholder='车牌号' key='name' />
                        </Item>
                    </Col>
                    <Col span={3}>
                        <Item name='carType'>
                            <JxtSelect key='carType' optionDisable={3} list={carTypeList} placeholder='培训车型' />
                        </Item>
                    </Col>
                </Form>
            </Row>
        </div>
    )
}

export default JxtTest

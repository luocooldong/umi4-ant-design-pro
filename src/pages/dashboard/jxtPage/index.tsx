// import useMergeValue from 'use-merge-value'
// import qs from 'qs'
// import 'isomorphic-fetch'
import { Row, Col } from 'antd'

import { JxtSelect, JxtSearchSelect } from 'jxt-components'

// console.log('JxtPage', qs)

const JxtTest = () => {
  return (
    <div>
      <span style={{ marginRight: 30 }}>test-lib</span>
      <JxtSelect/>
      <JxtSearchSelect />
    </div>
  )
}

export default JxtTest

import { defineComponent,ref,reactive,toRefs,toRaw } from "vue";

const rulesRef = (columns) => {
    let rulesObj = {}
    const formList = columns.formList || []
    formList.forEach(item => {
        if(item.rules){
            rulesObj[item.fieldName] = item.rules
        }
    })
    return rulesObj
}

const tableForm = defineComponent({
    name:'tableForm',
    props:{
        columns:{
            type:Array,
            default:[]
        },
        model:{
            type:Object,
            default:{}
        },
        getformfunc:{
            type:Object,
            default:{
                url:'',
                method: 'post'
            }
        }
    },
    setup(props){
        const formRef = ref(null);
        const propsModel = JSON.parse(JSON.stringify(props.model))
        const state = reactive({
            defaultValue:propsModel,
            formState:props.model,
            rulesRefData:rulesRef(props.columns)
        })

        const onSubmit = () => {
            formRef.value.validate().then(() => {
                console.log('values', state.formState, toRaw(state.formState));
                // alert(props.getformfunc.method)
            }).catch((error) => {
                console.log(error)
            })
        }
        const resetForm = () => {
            state.formState = JSON.parse(JSON.stringify(propsModel))
            formRef.value.resetFields();
        };
        return {
            ...toRefs(state),
            props,
            formRef,
            onSubmit,
            resetForm
        }
    },
    render(){
        // const tableForm = this.props.tableForm
        const { columns } = this.props
        const {formState,rulesRefData} = this
        return(
            <div className="teamlinker_form">
                
                <a-form style="width:100%;" ref="formRef" model={formState} rules={rulesRefData}>
                    <a-row>
                    {
                        columns.formList && columns.formList.map((columnsItem) => {
                            return (
                                columnsItem.tag && (
                                    <>
                                        {
                                            columnsItem.tag != 'action' && <a-col span={columns.colSpan ? 24/columns.colSpan : 12}>
                                                <a-form-item label={columnsItem.label} name={columnsItem.fieldName} label-col={columnsItem.labelCol} wrapper-col={columnsItem.wrapperCol} rules={Array.isArray(columnsItem.rules) && columnsItem.rules.length > 0 ? columnsItem.rules : []} key={columnsItem.fieldName}>
                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'text' && 
                                                        <a-input size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} v-model:value={formState[columnsItem.fieldName]}></a-input>
                                                    }
                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'select' && 
                                                        <a-select style="width: 100%" options={columnsItem.options} size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} v-model:value={formState[columnsItem.fieldName]}></a-select>
                                                    }
                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'number' && <a-input-number size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} min={columnsItem.min ? columnsItem.min : 1} style="width: 100%" placeholder={columnsItem.placeholder}  v-model:value={formState[columnsItem.fieldName]}></a-input-number>
                                                    }
                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'radio' && 
                                                        Array.isArray(columnsItem.options) && 
                                                        <a-radio-group size={columnsItem.size ? columnsItem.size : 'default'} buttonStyle="solid"  v-model:value={formState[columnsItem.fieldName]}>
                                                            {
                                                                columnsItem.options && columnsItem.options.map((item,index)=>{
                                                                    return (
                                                                        <a-radio-button key={index} value={item.value}>{ item.label } </a-radio-button>
                                                                    )
                                                                })
                                                            }
                                                        </a-radio-group>
                                                    }
                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'datetime' && 
                                                        <a-date-picker size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} v-model:value={formState[columnsItem.fieldName]}></a-date-picker>
                                                    }

                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'datetimeRange' && 
                                                        <a-range-picker size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} v-model:value={formState[columnsItem.fieldName]}></a-range-picker>
                                                    }

                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'cascader' && 
                                                        <a-cascader size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} options={columnsItem.options} v-model:value={formState[columnsItem.fieldName]}></a-cascader>
                                                    }

                                                    {
                                                        columnsItem.fieldName && 
                                                        columnsItem.tag === 'multiple' && 
                                                        <a-select mode="multiple" size={columnsItem.size ? columnsItem.size : 'default'} placeholder={columnsItem.placeholder} style="width:100%" options={columnsItem.options} v-model:value={formState[columnsItem.fieldName]}></a-select>
                                                    }
                                                </a-form-item>
                                            </a-col>
                                        }
                                        {
                                            columnsItem.tag === 'action' && (
                                                <a-col span={columnsItem.colSpan ? 24/columnsItem.colSpan : 24}>
                                                    <a-form-item>
                                                        <a-space style="float:right">
                                                            {
                                                                columnsItem.options && columnsItem.options.map((item)=>{
                                                                    return (
                                                                        item.tag && <a-button onClick={this[item.action]}>{item.text}</a-button>
                                                                    )
                                                                })
                                                            }
                                                        </a-space>
                                                    </a-form-item>
                                                </a-col>
                                            )
                                        }
                                    
                                    </>
                                )
                            )
                        })
                    }
                    </a-row>
                </a-form>
                
            </div>
        )
    }
})

export default tableForm
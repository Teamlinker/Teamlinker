import { defineComponent,reactive,toRefs,watch,ref } from "vue";
import './index.scss'
const Percentloop = defineComponent({
    name:'Percentloop',
    props:{
        percentNum:{
            type:[String, Number],
            dafault:0
        },
        speed: { // 建议取值为0-3
            type: [String, Number],
            default: 1
        },
        background:{
            type:String,
            default:'5093E1'
        }
    },
    setup(props){
        const state = reactive({
            percent: 80,
            initDeg: 0,
            timeId: null,
            animationing: false,
            leftcontent:{},
            rightcontent:{}
        })
        // methods
        const transformToDeg = (percent) => {
            let deg = 0
            if (percent >= 100) {
                deg = 360
            }else{
                deg = parseInt(360 * percent / 100)
            }
            return deg
        }
        const transformToPercent = (deg) => {
            let percent = 0
            if (deg >= 360) {
                percent = 100
            }else{
                percent = parseInt(100 * deg / 360)
            }
            return percent
        }
        // 大于180时，执行的动画
        const rotateLeft = (deg) => {
            state.leftcontent.transform = 'rotate(' + (deg - 180) + 'deg)'
        }
        // 小于180时，执行的动画
        const rotateRight = (deg) => {
            state.rightcontent.transform = 'rotate(' + deg + 'deg)'
        }
        
        const animationFinished  = () => {
            state.percent = props.percentNum // 百分比数据滚动动画
            state.animationing = false
            clearInterval(state.timeId)

            // $emit('animationFinished') // 动画完成的回调
        }

        const goRotate = (deg) => {
            state.animationing = true
            state.timeId = setInterval(() => {
                if (deg > state.initDeg) { // 递增动画
                    state.initDeg += Number(props.speed)
                    if (state.initDeg >= 180) {
                        rotateLeft(state.initDeg)
                        rotateRight(180) // 为避免前后两次传入的百分比转换为度数后的值不为步距的整数，可能出现的左右转动不到位的情况。
                    }else{
                        rotateRight(state.initDeg)
                    }
                }else{
                    // 递减动画
                    state.initDeg -= Number(props.speed)
                    if (state.initDeg >= 180) {
                        rotateLeft(state.initDeg)
                    }else{
                        rotateLeft(180) // 为避免前后两次传入的百分比转换为度数后的值不为步距的整数，可能出现的左右转动不到位的情况。
                        rotateRight(state.initDeg)
                    }
                }
                state.percent = transformToPercent(state.initDeg) // 百分比数据滚动动画
                const remainer = Number(deg) - state.initDeg
                if (Math.abs(remainer) < props.speed) {
                    state.initDeg += remainer
                    if (state.initDeg > 180) {
                        rotateLeft(deg)
                    }else{
                        rotateRight(deg)
                    }
                    animationFinished()
                }
            },10)
        }
        goRotate(transformToDeg(props.percentNum))
        watch(()=>props.percentNum,(val)=>{
            console.log(val)
        })
        return {
            ...toRefs(state),
            props,
            transformToDeg,
            transformToPercent
        }
    },
    render(){
        const {leftcontent,rightcontent,props} = this;
        return(
            <div className="percentloop">
                <div className="circle-left" style={{
                    backgroundColor:'#'+props.background
                }}>
                    <div style={leftcontent}></div>
                </div>
                <div className="circle-right" style={{
                    backgroundColor:'#'+props.background
                }}>
                    <div style={rightcontent}></div>
                </div>
                <div className="number">
                    {/* {this.percent} % */}
                </div>
            </div>
        )
    }
})

export default Percentloop
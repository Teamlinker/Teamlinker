export namespace Err {
    export let Common = {
        paramError:{
            code:1,
            msg:"param error"
        },
        mysqlError:{
            code:2,
            msg:"mysql error"
        },
        itemNotFound:{
            code:3,
            msg:"item not found"
        },
        itemExists:{
            code:4,
            msg:"item exists"
        },
        mysqlNotConfig:{
            code:5,
            msg:"mysql not config"
        },
        requestForbidden:{
            code:6,
            msg:"request forbidden"
        }
    }
    export let User = {
        userNotFound:{
            code:1000,
            msg:"user not found"
        },
        userExists:{
            code:1001,
            msg:"user exists"
        },
        userIdNotExists:{
            code:1002,
            msg:"user id not exists"
        },
        userNameNotExists:{
            code:1003,
            msg:"user not found"
        },
        userPasswordWrong:{
            code:1004,
            msg:"user password wrong"
        },
        notAuth:{
            code:1005,
            msg:"user not auth"
        },
        accessDenied:{
            code:1006,
            msg:"access denied"
        }
    }
    export let Http = {
        overFileSize:{
            code:2000,
            msg:"over file size"
        },
        requireParam:{
            code:2001,
            msg:"require param"
        },
        requireHeader:{
            code:2002,
            msg:"require header"
        }
    }
    export let Project = {
        userIdNotExists:{
            code:3000,
            msg:"project id not exists"
        },
        projectNotFound:{
            code:3001,
            msg:"project not found"
        },
        projectExists:{
            code:3002,
            msg:"project exists"
        },
        projectKeywordNotFound:{
            code:3003,
            msg:"project keyword not found"
        },
        projectIdNotMatch:{
            code:3004,
            msg:"project id not match"
        },
        Tag:{
            tagSizeEmpty:{
                code:3100,
                msg:"tag size empty"
            },
            tagNotfound:{
                code:3101,
                msg:"tag not found"
            },
            tagIssueExists:{
                code:3102,
                msg:"tag issue exists"
            }
        },
        Module:{
            moduleNotFound:{
                code:3200,
                msg:"module not found"
            },
            moduleIssueExists:{
                code:3201,
                msg:"module issue exists"
            }
        },
        Member:{
            memberExists:{
                code:3300,
                msg:"member exists"
            },
            memberNotExists:{
                code:3301,
                msg:"member not exists"
            },
            memberNotMatch:{
                code:3302,
                msg:"member not match"
            }
        },
        Issue : {
            issueTypeNotFound:{
                code:3400,
                msg:"issue type not found"
            },
            issueTypeForbidden:{
                code:3401,
                msg:"issue type forbidden"
            },
            issueTypeSolutionExists :{
                code:3402,
                msg:"issue type solution exists"
            },
            issueTypeSolutionNotFound:{
                code:3403,
                msg:"issue type solution not found"
            },
            issueTypeSolutionForbidden:{
                code:3404,
                msg:"issue type solution forbidden"
            },
            issueTypeNotInIssueTypeSolution:{
                code:3405,
                msg:"issue type not in issue solution"
            },
            issueTypeSolutionBindProject:{
                code:3406,
                msg:"issue type solution bind project"
            }
        },
        Workflow:{
            workflowNotFound:{
                code:3500,
                msg:"workflow not found"
            },
            workflowForbidden:{
                code:3501,
                msg:"workflow forbidden"
            },
            workflowNodeNotFound:{
                code:3502,
                msg:"workflow node not found"
            },
            workflowNodeForbidden:{
                code:3503,
                msg:"workflow node forbidden"
            },
            workflowActionNotFound:{
                code:3504,
                msg:"workflow action not found"
            },
            workflowActionForbidden:{
                code:3505,
                msg:"workflow action forbidden"
            },
            workflowSolutionNotFound:{
                code:3506,
                msg:"workflow solution not found"
            },
            workflowSolutionForbidden:{
                code:3507,
                msg:"workflow solution forbidden"
            },
            workflowOpenNodeDuplicate:{
                code:3508,
                msg:"workflow open node duplicate"
            },
            workflowSolutionNotBindIssueTypeSolution:{
                code:3509,
                msg:"workflow solution not bind issue type solution"
            },
            workflowNotInWorkflowSolution:{
                code:3510,
                msg:"workflow not in workflow solution"
            },
            workflowNodeNotInWorkflow:{
                code:3511,
                msg:"worflow node not in workflow"
            },
            workflowAlreadyInWorkflowSolution:{
                code:3512,
                msg:"workflow already in workflow solution"
            },
            issueTypeSolutionDuplicate:{
                code:3513,
                msg:"issue type solution duplicate"
            },
            unbindReservedWorkflowSolutionForbidden:{
                code:3514,
                msg:"unbind reserved workflow solution forbidden"
            }
        },
        Field:{
            fieldTypeNotFound:{
                code:3600,
                msg:"field type not found"
            },
            fieldSolutionNotFound:{
                code:3601,
                msg:"field solution not found"
            },
            fieldSolutionWorkflowNodeFieldTypeNotFound:{
                code:3602,
                msg:"field solution workflow node field Type not found"
            },
            fieldTypeConfigValueIdNotFound:{
                code:3603,
                msg:"field type config value id not found"
            },
            workflowSolutionNotBind:{
                code:3604,
                msg:"workflow solution not bind"
            },
            workflowSolutionAlreadyBind:{
                code:3605,
                msg:"workflow solution already bind"
            },
            fieldTypeNotMatch:{
                code:3606,
                msg:"field type not match"
            },
            fieldConfigValueAlreadySelected: {
                code:3607,
                msg:"field config value already selected"
            }
        },
        ProjectIssue:{
            projectIssueNotFound:{
                code:3700,
                msg:"project issue not found"
            },
            uniqueKeyError:{
                code:3701,
                msg:"unique key error"
            },
            parentChildExists:{
                code:3702,
                msg:"parent child issue exists"
            },
            relatedExists:{
                code:3703,
                msg:"related issue exists"
            },
            issueProjectNotMatch:{
                code:3704,
                msg:"issue project not match"
            }
        },
        Release: {
            releaseNotFound:{
                code:3800,
                msg:"release not found"
            },
            releaseIssueDuplicate:{
                code:3801,
                msg:"release issue duplicate"
            },
            releaseSizeEmpty:{
                code:3802,
                msg:"release size empty"
            },
            releaseDateError:{
                code:3803,
                msg:"release date error"
            },
            releaseStartDateNotLessReleaseDate:{
                code:3804,
                msg:"release start date not less release date"
            }
        }
    }
    export let Team = {
        teamNotFound:{
            code:4000,
            msg:"team not found"
        },
        teamExists:{
            code:4001,
            msg:"team exists"
        },
        teamMemberExists:{
            code:4002,
            msg:"team member exists"
        },
        teamMemeberNotExists:{
            code:4003,
            msg:"team member not exists"
        }
    }
    export let Role ={
        roleNotFound:{
            code:5000,
            msg:"role not found"
        },
        roleNotExists:{
            code:5001,
            msg:"role not exists"
        }
    }
    export let File ={
        fileNotFound:{
            code:6000,
            msg:"file not found"
        },
        md5NotExists:{
            code:6001,
            msg:"md5 not exists"
        }
    }

    export let Comment ={
        commentNotFound:{
            code:7000,
            msg:"comment not found"
        },
        commentTypeNotFound:{
            code:7001,
            msg:"comment type not found"
        }
    }

    export let Organization = {
        ownerNotFound:{
            code:8000,
            msg:"owner not found"
        },
        organizationNotFound:{
            code:8001,
            msg:"organization not found"
        },
        userAlreadyExists:{
            code:8002,
            msg:"user already exists"
        },
        userNotFound:{
            code:8003,
            msg:"user not found"
        },
        ownerDeleteForbidden:{
            code:8004,
            msg:"owner delete forbidden"
        },
        nicknameEmpty:{
            code:8005,
            msg:"nickname empty"
        }
    }

    export let Auth = {
        roleNotFound:{
            code:9000,
            msg:"role not found"
        },
        roleAlreadyExists: {
            code:9001,
            msg:"role already exists"
        }
    }
}

